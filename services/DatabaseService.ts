import { Database } from '../persistence'

export type Identifiable = { _id: string }

export type ItemChangedEvent<TItem> = {
  item: TItem,
  event: "added" | "removed" | "updated"
}

export type ItemChangedEventHandler<TItem> = (event: ItemChangedEvent<TItem>) => Promise<void>

export type GetAllRequest = {
  startKey?: string
  endKey?: string
  limit?: number
  skip?: number
}

export type GetManyRequest = {
  // ids: string[]
  selector?: any
  limit?: number
  skip?: number
}

export class DatabaseService<
  TItem extends Identifiable,
  TDbScheme extends Identifiable,
> {
  private _database: Database
  private _changeEventHandlers: ItemChangedEventHandler<TItem>[] = []
  private _deserializer: (document: TDbScheme) => TItem
  private _serializer: (item: TItem) => TDbScheme

  /**
   * Constructs a new instance of the DatabaseService class.
   * @param {Database} database Database.
   */
  constructor(
    database: Database,
    serializer: (item: TItem) => TDbScheme,
    deserializer: (document: TDbScheme) => TItem,
  ) {
    this._database = database
    this._serializer = serializer
    this._deserializer = deserializer
  }

  /**
   * Subscribes to item change events.
   * @param handler The event handler function to be called when an item changes.
   */
  public subscribe(
    handler: ItemChangedEventHandler<TItem>
  ) {
    // TODO: unsubscribe
    this._changeEventHandlers.push(handler)
  }

  /**
   * Retrieves a single item from the database based on the provided Id.
   * @param id The Id of the item to retrieve.
   * @returns A Promise that resolves to the retrieved item.
   * @throws Error if the item with the provided Id is not found in the database.
   */
  async getOne(
    id: string
  ): Promise<TItem> {
    const document = await this._database.db.get<TDbScheme>(id)
    if (!document) {
      throw new Error(`Document with Id ${id} on database ${this._database.db.name} not found`)
    }
    return this._deserializer(document)
  }

  /**
   * Retrieves all items from the database.
   * @param request - Optional request parameters.
   * @returns A promise that resolves to an array of items.
   */
  async getAll(
    request?: GetAllRequest
  ): Promise<TItem[]> {
    const dbRequest: any = {}
    if (request?.startKey) { dbRequest.startkey = request.startKey }
    if (request?.endKey)   { dbRequest.endkey = request.endKey }
    if (request?.limit)    { dbRequest.limit = request.limit }
    if (request?.skip)     { dbRequest.skip = request.skip }

    const allDocs = await this._database.db.allDocs<TDbScheme>({
      ...dbRequest,
      include_docs: true
    })

    return allDocs.rows.map(row => this._deserializer(row.doc!))
  }

  async getMany(
    request: GetManyRequest
  ): Promise<TItem[]> {
    const dbRequest: any = {}
    if (request?.limit) { dbRequest.limit = request.limit }
    if (request?.skip)  { dbRequest.skip = request.skip }

    const entities = await this._database.db.find({
      selector: request.selector,
      limit: request.limit,
      skip: request.skip,
    })

    return entities.docs
      // .filter(x => "id" in x)
      // @ts-ignore
      .map(doc => this._deserializer(doc))
  }

  async getCount(): Promise<number> {
    return (await this._database.db.allDocs()).total_rows
  }


  /**
   * Adds an item to the database with the specified Id.
   * @param item The item to be added.
   * @returns A promise that resolves when the item is successfully added.
   */
  async addOne(
    item: TItem
  ): Promise<void> {
    try {
      await this._database.db.put({
        ...this._serializer(item)
      })
    } catch (error) {
      console.error('Error adding item to database', error)
    }
    await this.notifyChange({ item, event: 'added' })
  }

  /**
   * Updates a single item in the database.
   * @param id - The Id of the item to update.
   * @param item - The partial item object containing the updated properties.
   * @returns A promise that resolves to void when the update is complete.
   */
  async updateOne(
    id: string,
    item: TItem
  ): Promise<void> {
    const document = await this._database.db.get<TDbScheme>(id)
    const updatedDocument = { ...document, ...this._serializer(item) }
    const updatedItem = this._deserializer(updatedDocument)
    await this._database.db.put(updatedDocument)
    await this.notifyChange({ item: updatedItem, event: 'updated' })
  }

  /**
   * Removes a document from the database.
   * @param id The ID of the document to be removed.
   * @returns A promise that resolves when the document is successfully removed.
   */
  async removeOne(
    id: string
  ): Promise<void> {
    const document = await this._database.db.get<TDbScheme>(id)
    const item = this._deserializer(document)
    await this._database.db.remove(document)
    await this.notifyChange({ item, event: 'removed' })
  }

  /**
   * Notifies all subscribers of a change event.
   * @param event The event to be broadcasted to all subscribers.
   */
  private async notifyChange(
    event: ItemChangedEvent<TItem>
  ) {
    for (const handler of this._changeEventHandlers) {
      await handler(event)
    }
  }
}

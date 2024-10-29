import { type DocumentId, type InboxTrack, type NormalizedValue, type Reference } from '../models'
import { Database } from '../persistence'
import { DatabaseService } from './DatabaseService'



type InboxTrackDbScheme = {
  _id: string
  trackId: string
  source: string
  title: NormalizedValue<string>
  author: NormalizedValue<DocumentId>
  location: NormalizedValue<DocumentId>
  references: NormalizedValue<Reference>[]
  date: NormalizedValue<number[]>
  status: "ready" | "processing" | "error"
}


const inboxTrackSerializer   = (item: InboxTrack): InboxTrackDbScheme => item
const inboxTrackDeserializer = (document: InboxTrackDbScheme): InboxTrack => document
//   ({
//   _id: document._id,
//   trackId: document.trackId,
//   source: document.source,
//   title: document.title,
//   author: document.author,
//   location: document.location,
//   references: document.references,
//   date: document.date.normalized ? document.date : { original: "RAE", normalized: [undefined, undefined, undefined] },
//   status: document.status,
// })


export class InboxTracksService {
  private _databaseService: DatabaseService<InboxTrack, InboxTrackDbScheme>
  private _cache: Map<string, InboxTrack> = new Map()

  constructor(database: Database) {
    this._databaseService = new DatabaseService(
      database, inboxTrackSerializer, inboxTrackDeserializer)
  }

  /**
   * Retrieves an InboxTrack by its id.
   * @param id Id of the author
   * @returns InboxTrack
   */
  public async getOne(
    id: string
  ): Promise<InboxTrack> {
    const entity = (
      this._cache.get(id) ||
      await this._databaseService.getOne(id))
    this._cache.set(id, entity)
    return entity
  }

  /**
   * Retrieves all inbox tracks.
   * @returns Array of authors
   */
  public async getAll(): Promise<InboxTrack[]> {
    return this._databaseService.getAll()
  }


  /**
   * Updates a single inbox track in the database.
   * @param id - The Id of the item to update.
   * @param item - The partial item object containing the updated properties.
   * @returns A promise that resolves to void when the update is complete.
   */
  public async updateOne(
    id: string,
    item: InboxTrack
  ) {
    await this._databaseService.updateOne(id, item)
  }

}

import { Author } from '../models'
import { Database } from '../persistence'
import { DatabaseService } from './DatabaseService'

export type AuthorDbScheme = {
  _id: string
  name: Record<string, { full: string, short: string }>
}

const authorSerializer   = (item: Author): AuthorDbScheme => item.props
const authorDeserializer = (document: AuthorDbScheme): Author => {
  const { _id, ...rest } = document
  return new Author({ _id: _id.replace("author::", ""), ...rest })
}


export class AuthorsService {
  private _databaseService: DatabaseService<Author, AuthorDbScheme>
  private _cache: Map<string, Author> = new Map()

  constructor(database: Database) {
    this._databaseService = new DatabaseService(
      database, authorSerializer, authorDeserializer)
  }

  /**
   * Retrieves an author by its id.
   * @param id Id of the author
   * @returns Author
   */
  public async getOne(
    id: string
  ): Promise<Author> {
    const entity = (
      this._cache.get(id) ||
      await this._databaseService.getOne(`author::${id}`))
    this._cache.set(id, entity)
    return entity
  }

  /**
   * Retrieves all authors.
   * @returns Array of authors
   */
  public async getAll(): Promise<Author[]> {
    return this._databaseService.getAll({
      startKey: 'author::',
      endKey: 'author::\uffff',
    })
  }
}

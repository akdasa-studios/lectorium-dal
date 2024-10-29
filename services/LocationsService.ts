import { Location } from '../models'
import { Database } from '../persistence'
import { DatabaseService } from './DatabaseService'

/**
 * Schema of the Source documents in the Library collection.
 */
type LocationsDBSchema = {
  _id: string
  name: {
    [language: string]: string
  }
}

type LocationRef = { id?: string, name?: string } | undefined

const locationSerializer   = (item: Location): LocationsDBSchema => item.props
const locationDeserializer = (document: LocationsDBSchema): Location => {
  const { _id, ...rest } = document
  return new Location({ _id: _id.replace("location::", ""), ...rest })
}


/**
 * Service for retrieving location information.
 */
export class LocationsService {
  private _databaseService: DatabaseService<Location, LocationsDBSchema>
  private _cache: Map<string, Location> = new Map()

  constructor(database: Database) {
    this._databaseService = new DatabaseService(
      database, locationSerializer, locationDeserializer)
  }

  /**
   * Retrieves a location based on its ID.
   * @param id - The ID of the location.
   * @returns A Promise that resolves to the location.
   */
  async getOne(
    id: string
  ): Promise<Location> {
    const entity = (
      this._cache.get(id) ||
      await this._databaseService.getOne(`location::${id}`))
    this._cache.set(id, entity)
    return entity
  }

  async getName(
    param: LocationRef,
    lang: string
  ): Promise<string | undefined> {
    const result = param?.name || param?.id
    try {
      return param?.id
        ? (await this.getOne(param.id)).getName(lang)
        : result
    } catch (error) {
      // TODO: use logger service
      console.error("No location found for ID", param?.id)
      return result
    }
  }

  /**
   * Retrieves all available locations.
   * @returns A Promise that resolves to all available locations.
   */
  async getAll(): Promise<Location[]> {
    return this._databaseService.getAll({
      startKey: 'location::',
      endKey: 'location::\uffff',
    })
  }
}

export interface BaseRepository<T> {
  getById(id: string): Promise<T>;
  create(model: T): Promise<T>;
}

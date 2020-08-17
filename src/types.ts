export interface DatabaseConnection {
  name: string
  connect: () => Promise<any>
}

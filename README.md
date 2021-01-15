# Nd SQL

SQL Templating tool for postgreSQL, NodeJS and TypeScript collaboration.
The library allows you to separate class logic and prepared SQL queries while keeping SQL flexible


With NdSql your table class look like this:
```typescript
@DbTable({
  dependencies: [LocationsDbTable],
  init: `./cities.init.sql`,
  drop: `./cities.drop.sql`,
  initData: `./cities.init-data.sql`,
})
export class CitiesDbTable implements IDbCreateOneRecord {
  constructor(private readonly _dbRequester: DbRequester) {}

  @GetSql(`./cities.create.sql`)
  public async createOne(value: ICityTableParams, sql?: string): Promise<ICityTableParams> {
    return this._dbRequester.createOne<ICityTableParams>({
      sql,
      value,
    });
  }
}
```


Your SQL file look like this:
```sql
WITH
  cities_data(id, title, location) AS (
    VALUES
    [[(:id::UUID, :title, :location::JSON)]]:list:
  ),
  locations_result AS (
    INSERT INTO locations(id, coords, zoom)
    SELECT
      UUID(cities_data.location->>'id') AS id,
      ST_POINT(CAST(cities_data.location->>'latitude' AS FLOAT8), CAST(cities_data.location->>'longitude' AS FLOAT8)) AS coords,
      CAST(cities_data.location->>'zoom' AS INTEGER) AS zoom
    FROM cities_data
    RETURNING
      id,
      coords,
      zoom
  ),
  cities_result AS (
    INSERT INTO cities(id, title, location_id)
    SELECT
      cities_data.id AS id,
      cities_data.title AS title,
      UUID(cities_data.location->>'id') AS location_id
    FROM cities_data
    RETURNING
      id,
      title,
      location_id
  )
SELECT
  cities_result.id AS id,
  cities_result.title AS title,
  JSON_BUILD_OBJECT(
    'id', locations_result.id,
    'latitude', ST_X(locations_result.coords),
    'longitude', ST_Y(locations_result.coords),
    'zoom', locations_result.zoom
  ) AS location
FROM cities_result
LEFT JOIN locations_result ON cities_result.location_id = locations_result.id;
```

##Get started:
1) Install the npm package:
```
npm install nd-sql
```

2) Create `db-config.json` with content:
```json
{
  "ignoreDirs": [
    "node_modules",
    "test",
    ".git"
  ],
  "match": ".db-table."
}
```

3) If you use Nest.js add to nest-cli.json:
```json
{
  ...
  "compilerOptions": {
    ...
    "assets": ["**/*.sql"],
    "watchAssets": true,
    ...
  },
  ...
}
```
Needed to monitor changes to the sql files

and create `db.module.ts` contents:
```typescript
import { DynamicModule, Module } from "@nestjs/common";

import { DbConnector, DbRequester, EDrivers, IDbConnectorConfig } from "nd-sql";

@Module({})
export class DbModule {
  static async forRoot(config: Partial<IDbConnectorConfig>): Promise<DynamicModule> {
    if (process.env.MODE === `test`) {
      return;
    }

    const connector: DbConnector = await DbConnector.init({
      driver: config.driver || (process.env.DB_DRIVER as EDrivers),
      host: config.host || process.env.DB_HOST,
      port: config.port || Number(process.env.DB_PORT),
      user: config.user || process.env.DB_USER,
      database: config.database || process.env.DB_DATABASE,
      password: config.password || process.env.DB_PASSWORD,
      force: config.force || process.env.DB_FORCE.toLowerCase() === `true`,
      entities: config.entities,
    });

    const dbRequester = {
      provide: DbRequester,
      useValue: new DbRequester(connector),
    };
    const services = config.entities.map((Repository) => ({
      provide: Repository,
      useFactory: (dbRequester: DbRequester) => new Repository(dbRequester),
      inject: [DbRequester],
    }));
    return {
      module: DbModule,
      providers: [dbRequester, ...services],
      exports: [dbRequester, ...services],
    };
  }
}
```
and connect it to the module where you use db table classes, for example:
```typescript
@Module({
  imports: [
    DbModule.forRoot({
      entities: [
        CitiesDbTable,
        CommentsDbTable,
        FavoritesDbTable,
        FeaturesDbTable,
        HotelsImagesDbTable,
        HotelTypesDbTable,
        HotelsDbTable,
        HotelsFeaturesDbTable,
        ImagesDbTable,
        LocationsDbTable,
        RatingsDbTable,
        RefreshTokensDbTable,
        UserTypesDbTable,
        UsersDbTable,
      ],
    }),
  ],
})
export class CommonAdapterModule {}
```
where `entities` are your db tables


or if you don't use Nest.js you can create file with next content:

```typescript
import { DbConnector, DbRequester, EDrivers, IDbConnectorConfig } from "nd-sql";

const connector: DbConnector = await DbConnector.init({
  driver: config.driver || (process.env.DB_DRIVER as EDrivers),
  host: config.host || process.env.DB_HOST,
  port: config.port || Number(process.env.DB_PORT),
  user: config.user || process.env.DB_USER,
  database: config.database || process.env.DB_DATABASE,
  password: config.password || process.env.DB_PASSWORD,
  force: config.force || process.env.DB_FORCE.toLowerCase() === `true`,
  entities: config.entities,
});

export const dbRequester = new DbRequester(connector);
```


## Docs
- [db-config](#db-config)
- DbConnector
- DbRequester
- Decorator
- Additional features for working with SQL


### <a name="#db-config"></a>db-config
Config allows optimize searching of database table classes`* .sql`
- `ignoreDirs` - ignore dirs when searching database table classes
- `match` - sets part of the file name to look for


### DbConnector
Database connector allows to connect to DB

`init` method with config params:
- `driver` - tries to connect db (for example `"postgreSQL"`)
- `host` - db host
- `port` - db port
- `user` - allows you to connect as a DB user
- `database` - DB name
- `password` - user password
- `force` - allows synchronize database table classes content with database (
  <span style="color: red">ATTENTION! Don't use in the production or use false value</span>)
- `entities` - database table classes for interaction with database

`query` method allows request with object param has properties:
- `text` - query text
- `values` - array of params


### DbRequester
Requester allows request to DB via:
- `createOne` - create one record (has `IDbCreateOneRecord` interface)
- `createList` - creates record array (has `IDbCreateAllRecords` interface)
- `updateOne` - update one record has `IDbUpdateOneRecord` interface)
- `removeOne` - remove one record (has `IDbRemoveOneRecord` interface)
- `findOne` - find one record (has `IDbFindOneRecord` interface)
- `findList`- find list of record (has `IDbFindAllRecords` interface)


### Decorators

#### DbTable
`@DbTable` decorator allows create a table in database if not exists, config can contain:
- `dependencies` - allows build db tables queue for correct table creating
- `init` - path to SQL file of the database table to initialize the table  
- `initSql` - SQL query of the database table to initialize the table
- `drop` - path to SQL file of the database table to drop the table
- `dropSql` - SQL query of the database table to drop the table
- `initData` - path to SQL file of the database table to initialize data of the table
- `initDataSql` - SQL query of the database table to initialize data of the table

for example:
```typescript
@DbTable({
  dependencies: [LocationsDbTable],
  init: `./cities.init.sql`,
  drop: `./cities.drop.sql`,
  initData: `./cities.init-data.sql`,
})
export class CitiesDbTable implements IDbCreateOneRecord {}
```

`@GetSql` decorator allows use `*.sql` file to query the database
for example:
```typescript
@DbTable({...})
export class CitiesDbTable implements IDbCreateOneRecord {
  constructor(private readonly _dbRequester: DbRequester) {}

  @GetSql(`./cities.create.sql`)
  public async createOne(value: ICityTableParams, sql?: string): Promise<ICityTableParams> {
    return this._dbRequester.createOne<ICityTableParams>({
      sql,
      value,
    });
  }
}
```

`@SetDefaultParams` decorator allows set default value params, if parameter is `undefined` (
<span style="color: red">IMPORTANT! Always set default parameters for correct working, all used SQL file parameters should be specified
</span>)
for example:
```typescript
@DbTable({...})
export class CitiesDbTable implements IDbFindOneRecord {
  constructor(private readonly _dbRequester: DbRequester) {}

  @GetSql(`./cities.find.sql`)
  @SetDefaultParams(defaultParams)
  public findOne(value?: Partial<ICityTableParams>, sql?: string): Promise<ICityTableParams> {
    return this._dbRequester.findOne<ICityTableParams>({
      sql,
      value,
    });
  }
}
```


### Additional features for working with SQL
- named params - allows use object properties how values of Requester methods, for example:

`favorites.db-table.ts` contains:  
```typescript
@DbTable({...})
export class FavoritesDbTable implements IDbCreateOneRecord {
  constructor(private readonly _dbRequester: DbRequester) {}

  @GetSql(`./favorites.create.sql`)
  public async createOne(value: ICityTableParams, sql?: string): Promise<ICityTableParams> {
    return this._dbRequester.createOne<ICityTableParams>({
      sql,
      value,
    });
  }
}
```
`favorites.create.sql` contain:
```sql
INSERT INTO favorites (hotel_id, user_id) VALUES (:hotel_id::UUID, :user_id::UUID);
```
`createOne` method should be called with:
```typescript
favoritesDbTable.createOne({
  hotel_id: `1008131ec-cb07-499a-86e4-6674afa31532`,
  user_id: `008131ec-cb07-499a-86e4-6674afa31532`,
});
```

- [[]]:list: construction allows pass array of objects, for example:
  `favorites.db-table.ts` contains:
```typescript
@DbTable({...})
export class FavoritesDbTable implements IDbCreateAllRecords {
  constructor(private readonly _dbRequester: DbRequester) {}

  @GetSql(`./favorites.create.sql`)
  public createAll(list: IFavoriteTableParams[], sql?: string): Promise<IFavoriteTableParams[]> {
    return this._dbRequester.createList({
      sql,
      list,
    });
  }
}
```
`favorites.create.sql` contain:
```sql
INSERT INTO favorites (hotel_id, user_id) VALUES [[(:hotel_id::UUID, :user_id::UUID)]]:list:;
```
`createAll` method should be called with:
```typescript
favoritesDbTable.createAll([
  {
    hotel_id: `1008131ec-cb07-499a-86e4-6674afa31532`,
    user_id: `208131ec-cb07-499a-86e4-6674afa31532`,
  },
  {
    hotel_id: `3008131ec-cb07-499a-86e4-6674afa31532`,
    user_id: `408131ec-cb07-499a-86e4-6674afa31532`,
  }
]);
```

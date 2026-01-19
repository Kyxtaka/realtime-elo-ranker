/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';


export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'db-ovh.hikarizsu.fr',
        port: 3893,
        username: 'root',
        password: 'ThIsIsIsntS3cur3d',
        database: 'TPNESTJS',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
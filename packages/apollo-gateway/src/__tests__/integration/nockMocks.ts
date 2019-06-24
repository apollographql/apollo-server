import nock from 'nock';

export const mockLocalhostSDLQuery = () =>
  nock('http://localhost:4001', { encodedQueryParams: true })
    .post('/graphql', {
      query: 'query GetServiceDefinition { _service { sdl } }',
    })
    .reply(
      200,
      {
        data: {
          _service: {
            sdl:
              'extend type Query {\n  me: User\n  everyone: [User]\n}\n\ntype User @key(fields: "id") {\n  id: ID!\n  name: String\n  username: String\n}\n',
          },
        },
      },
      {
        'Content-Type': 'application/json',
      },
    );

export const mockFetchStorageSecret = () =>
  nock('https://storage.googleapis.com:443', { encodedQueryParams: true })
    .get(
      '/engine-partial-schema-prod/mdg-private-6077/storage-secret/232d3a78a4392a756d37613458805dd830b517453729dc4945c24ca4b575cfc270b08e763cea5a8da49c784b31272d1c79b1d598cdc6e4d6913700a5505cd2f7.json',
    )
    .reply(
      200,
      [
        '1f',
        '8b',
        '08',
        '00',
        '00',
        '00',
        '000000035332334831b434b734d43548b434d53531324ad44d3437b3d04d4e4e3435333348b34c4c365702008b81631826000000',
      ],
      {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
      },
    );

// get composition config link, using received storage secret
export const mockGetCompositionConfigLink = () =>
  nock('https://storage.googleapis.com:443', { encodedQueryParams: true })
    .get(
      '/engine-partial-schema-prod/60d19791-0a95-422a-a768-cca5660f9ac7/current/v1/composition-config-link',
    )
    .reply(
      200,
      [
        '1f',
        '8b',
        '08',
        '0000000000000325cccb0d02211000d05e383bf21106d82a3c791f6741315930805e8cbdbb89af80f711dc6a2eb733cdbb5804aa55471f35288a0eac3104e431003339449523b197fcea3dd529df5a72db9e6d94595a857f34a43348579503f813ee876684603d815b4352c94467391f1fa3557110b9f58de625f5b10f62d1df1fc566aa6190000000',
      ],
      {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    );

// get composition configs, using received composition config link
export const mockGetCompositionConfigs = () =>
  nock('https://storage.googleapis.com:443', { encodedQueryParams: true })
    .get(
      '/engine-partial-schema-prod/60d19791-0a95-422a-a768-cca5660f9ac7/current/v1/composition-configs/526ab0f8-7365-41c6-847a-5d8e0e2954cf.json',
    )
    .reply(
      200,
      [
        '1f8b08000000000000034d90b16e1c310c44ff45b5d74b521225dd17a44867204d9082a2c8f882ec9eb17b7663f8dfa324089096e0cc9b99f7e0b76393fb173bceeb6d0f177c08d7112e21134b07af4b899c9784ca4b4d45963caa8151cb493dccdfede5a76db6dfaffbf7273bdeae6a9f6f2af7e97586cbd7f7b0cb66d34e546faffbfd9c9217b93fcf0bc3c0561a2e206d02886491c2755195cc0cde44cbaaafc731cdd7375cff272de75fd4b9fef35d4b14e251910bc694dcab756a92e3a8ad7bd64a390fc5d4a289b30b38f634d0005a01ee4263986949997b823ef92c80031a241d9db2387a258ad63c9177058796236365cd02d6011f7f9c73be8f6f0fe1d467dbe4939cbf5b6a6632191d39c642313115436e55b520688b831be706b3784f9e51b37713ced68620c90cdc63751932d5510169823512cef1726c5838691ec9e78449128d3f199dac51d3e415ba848f5f8438ec47e2010000',
      ],
      {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
      },
    );

// get implementing service reference, using received composition-config
export const mockGetImplementingServices = () =>
  nock('https://storage.googleapis.com:443', { encodedQueryParams: true })
    .get(
      '/engine-partial-schema-prod/60d19791-0a95-422a-a768-cca5660f9ac7/current/v1/implementing-services/accounts/73a26d81671344ff8eb29a53d89bf5c8255dc1493eaf6fa0f1b4d1e009706ba2ddeec7456b40b6606a01d0904cdb25af1f8223e9f42fbc0f09536186c5a0eb01.json',
    )
    .reply(
      200,
      [
        '1f8b08000000000000032d90bb6ec3300c45ff45730c536f2973976e050a642725b136e01764251d8afe7bd5361b710fef01c82fc17b5db1dd4a3de77d135779111f158fe9f5455cc59a3f86a3ce0f6c6570e0bd78c21bd619b7d637d2bdd6d2a78bd8702d3dc094f6fbd6ce9e1c58db8ccb7b9aca8a6fd8a68e1d64197d940360b483510a07f42e0c29a1750e3862f2e3533a56fc1c9e92e1fcb39ca3f2402918a7d9446f0c98643c922d96c979e6eca256a4341a451a8882b221781d038728ad2607d25291cae6a894e29c0299c84912ab64bdd63143e71e14b0b42e6196d25896a4bd72e4289a7e572d8ff9ff590280ad94110c1449c04c6831b352803658f4143449a6fcdbbad7a517a6d68eeb382e7bc265dacf763500527cff00fb367ce587010000',
      ],
      {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
      },
    );

// get raw-partial-schema, using received composition-config
export const mockGetRawPartialSchema = () =>
  nock('https://storage.googleapis.com:443', { encodedQueryParams: true })
    .get(
      '/engine-partial-schema-prod/60d19791-0a95-422a-a768-cca5660f9ac7/current/raw-partial-schemas/270bc8463f4974404c47ab5e5fb67ffd6932b23a42b30bb825887398f89153b6015be125d9222fdc8b49fc1bf2c57339d05be7020f156cad1145f1b3726b6b94',
    )
    .reply(
      200,
      [
        '1f8b08000000000000034bad2849cd4b5128a92c4855082c4d2daa54a8e65250c84db552082d4e2d023253cb8082f97940816890482c572d1717583588a7e0909d5aa99196999a93526ca5a09499a2a409d69f9962a5e0e9a20864e52582cc0a2e29cacc4b07724b819a50846ab90003647a4182000000',
      ],
      {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
      },
    );

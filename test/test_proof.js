const DarkBush = artifacts.require("DarkBush");
const Verifier = artifacts.require("Verifier");


contract("Testing proof verifier", async accounts => {
  it("Testing proof", async () => {
    const instance = await DarkBush.deployed();
    const result = await instance.spawn([
        '0x2e2d049202064093b06bec7ef3bb09bc793d0fbbc846fb54a4b7d56d1068e4f4',
        '0x0332dd05fc20338ba53e9a6b073b1d5c953bf2fa3a7fb0ec0b5e2fc589dba742'
    ],
    [
        [
          '0x2303e0049c44da3b7280d344a5ff6cf410f98291b8b69729ccb603aaa648f0c5',
          '0x0d000399cfdc8ccfc85d9af5ce14ac52ad4af6d0fed662ab5bda7624566d47fe'
        ],
        [
          '0x2f2a18515c43f3e1d737ded4ed62b02ccde8bb86279193fe9b784d8c96030cef',
          '0x08c5a452a73a80ff8d1cf38ccb02b9d6c55cb509a428f392888336d60c477de9'
        ]
      ],
      [
        '0x24cc1c10810a7bf81c6868a4941a35048b46b09edbf976c219d4350c86012786',
        '0x11edc556d68f63e032a6b2b3e0f01d1e7cd134f86b40e1bbe0be12823771bb67'
      ],
      [
        '0x0a1a277a0aa3882ffabedcea62e2dcebff1f99396bb1c9b1c682cc2a1487476a'
      ]);
    assert.equal(result, true);
  });
});


//[["0x2303e0049c44da3b7280d344a5ff6cf410f98291b8b69729ccb603aaa648f0c5","0x0d000399cfdc8ccfc85d9af5ce14ac52ad4af6d0fed662ab5bda7624566d47fe"],["0x2f2a18515c43f3e1d737ded4ed62b02ccde8bb86279193fe9b784d8c96030cef","0x08c5a452a73a80ff8d1cf38ccb02b9d6c55cb509a428f392888336d60c477de9"]]
// ["0x24cc1c10810a7bf81c6868a4941a35048b46b09edbf976c219d4350c86012786","0x11edc556d68f63e032a6b2b3e0f01d1e7cd134f86b40e1bbe0be12823771bb67"],
//   ["0x0a1a277a0aa3882ffabedcea62e2dcebff1f99396bb1c9b1c682cc2a1487476a"]
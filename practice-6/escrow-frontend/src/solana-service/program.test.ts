import { PublicKey, Connection } from "@solana/web3.js";

class EscrowProgramMock {
  constructor(public connection: Connection) { }

  async getTokenProgramId(mint: PublicKey): Promise<PublicKey> {
    console.log(`Fetching info for mint: ${mint.toString()}`);
    const info = await this.connection.getParsedAccountInfo(mint);
    console.log('Full account info:', JSON.stringify(info, null, 2));

    if (!info.value) {
      console.warn('No account info found for mint:', mint.toString());
      throw new Error('Unable to fetch token mint info');
    }

    const programId = new PublicKey(info.value.owner);
    console.log(`Program ID found: ${programId.toString()}`);
    return programId;
  }
}

const checkDevnetConnection = async (connection: Connection): Promise<boolean> => {
  try {
    const version = await connection.getVersion();
    console.log('Connected to Solana devnet, version:', version);
    return true;
  } catch (error) {
    console.error('Failed to connect to Solana devnet:', error);
    return false;
  }
};

describe('getTokenProgramId', () => {
  let escrowProgram: EscrowProgramMock;

  beforeAll(async () => {
    const connection = new Connection('https://api.devnet.solana.com');
    const isConnected = await checkDevnetConnection(connection);
    if (!isConnected) {
      throw new Error('Cannot connect to Solana devnet - skipping all tests');
    }

    escrowProgram = new EscrowProgramMock(connection);
  });

 // Real SPL token mints on devnet
 const SPL_MINTS = [
    "GdHsojisNu8RH92k4JzF1ULzutZgfg8WRL5cHkoW2HCK", // HOT
    "9NCKufE7BQrTXTang2WjXjBe2vdrfKArRMq2Nwmn4o8S", // BURGER
  ];

  // Real Token-2022 program mints on devnet
  const TOKEN2022_MINTS = [
    "Em2Ka6RpPmXFLsH5nKNn2wSnjUfsXPaZJUXcc3A5ZKFA",
    "4Hx7GJGsQSbCLt1sWfqyNvHNiSSkCiadLgREyh4fmqZg",
  ];

  const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const TOKEN2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

  it('should return SPL Token program ID for SPL mints', async () => {
    for (const mint of SPL_MINTS) {
      console.log(`\n=== Testing SPL mint: ${mint} ===`);
      const programId = await escrowProgram.getTokenProgramId(new PublicKey(mint));
      expect(programId.toString()).toBe(SPL_TOKEN_PROGRAM_ID);
    }
  }, 30000);

  it('should return Token-2022 program ID for Token-2022 mints', async () => {
    for (const mint of TOKEN2022_MINTS) {
      console.log(`\n=== Testing Token-2022 mint: ${mint} ===`);
      const programId = await escrowProgram.getTokenProgramId(new PublicKey(mint));
      expect(programId.toString()).toBe(TOKEN2022_PROGRAM_ID);
    }
  }, 30000);

  it('should return NativeLoader for invalid mint', async () => {
    const invalidMint = new PublicKey('11111111111111111111111111111111');
    console.log(`\n=== Testing invalid mint ===`);
    const programId = await escrowProgram.getTokenProgramId(invalidMint);
    console.log('Invalid mint response:', programId.toString());
    expect(programId.toString()).toBe('NativeLoader1111111111111111111111111111111');
  }, 30000);
});

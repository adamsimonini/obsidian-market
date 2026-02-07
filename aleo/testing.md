testnet deployment: https://testnet.explorer.provable.com/program/obsidian_market.aleo

# Testing

Once deployed, an application lives on the ledger forever. Consequently, it's important to consider every edge case and rigorously test your code.

## Tools & Techniques

- **Unit and Integration Testing** - Validate Leo program logic through test cases.
- **Running a Devnet** - Deploy and execute on a local devnet.
- **Deploying/Executing on Testnet** - Deploy and execute on the Aleo Testnet.

## Unit and Integration Testing

The Leo testing framework enables developers to validate their Leo program logic by writing unit and integration tests. Tests are written in Leo and are located in a `tests/` subdirectory of the main Leo project directory.

```
obsidian_market
├── build/
├── src/
│   └── main.leo
├── tests/
│   └── test_leo.leo
├── .env
└── program.json
```

The test file is a Leo program that imports the program in `main.leo`. Test functions are annotated with `@test` above the function declaration.

> **Note:** The name of the test file must match the program name within that file. For example, `test_leo.leo` must contain `program test_leo.aleo`.

### Testing Transition Functions

```leo
@test
transition test_simple_addition() {
    let result: u32 = example_program.aleo/simple_addition(2u32, 3u32);
    assert_eq(result, 5u32);
}
```

The `@should_fail` annotation should be added after `@test` for tests that are expected to fail:

```leo
@test
@should_fail
transition test_simple_addition_fail() {
    let result: u32 = example_program.aleo/simple_addition(2u32, 3u32);
    assert_eq(result, 3u32);
}
```

### Testing Records

Record and struct fields can be validated in tests:

```leo
@test
transition test_record_maker() {
    let r: example_program.aleo/Example = example_program.aleo/mint_record(0field);
    assert_eq(r.x, 0field);
}
```

### Modeling On-Chain State with Scripts

The testing framework cannot access real on-chain state. Instead, use `script` tests to await Futures and interact with mappings directly:

```leo
@test
script test_async() {
    const VAL: field = 12field;
    let fut: Future = example_program.aleo/set_mapping(VAL);
    fut.await();
    assert_eq(Mapping::get(example_program.aleo/map, 0field), VAL);

    let rand_val: field = ChaCha::rand_field();
    Mapping::set(example_program.aleo/map, VAL, rand_val);
    let value: field = Mapping::get(example_program.aleo/map, VAL);
    assert_eq(value, rand_val);
}
```

> **Note:** External transitions (async or not) may be called from test transitions or scripts, but external async functions may only be called directly from scripts.

## Running Tests

```bash
# Run all tests
leo test

# Run a specific test by name
leo test test_async

# Run tests matching a substring
leo test addition
```

### Important: `@admin` and Private Key

`leo test` creates a local test ledger with pre-funded dev accounts. If your program uses `@admin`, the `@admin` address **must match** the private key used to run tests — otherwise deployment will fail with "Deployment transaction not accepted."

The recommended dev key for testing:

- **Private Key:** `APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH`
- **Address:** `aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px`

You can override the key used for tests:

```bash
leo test --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH
```

## Running a Local Devnet

For deployment and execution testing, use amareleo-chain (lightweight single-node devnet):

```bash
# Start (in-memory, state lost on stop)
amareleo-chain start

# Start with persistent state
amareleo-chain start --keep-state
```

Or use `leo devnet` (heavier, requires 4 validators minimum):

```bash
leo devnet start --num-validators 4 --num-clients 0
```

module 0x33a8693758d1d28a9305946c7758b7548a04736c35929eac22eb0de2a865275d::managed_shard {
    public fun get_shard_balance(arg0: address) : u64 {
        0x33a8693758d1d28a9305946c7758b7548a04736c35929eac22eb0de2a865275d::shard_token::get_shard_balance(arg0)
    }
    
    public entry fun initialize_module(arg0: &signer) {
        0x33a8693758d1d28a9305946c7758b7548a04736c35929eac22eb0de2a865275d::shard_token::initialize_module(arg0);
    }
    
    // decompiled from Move bytecode v6
}


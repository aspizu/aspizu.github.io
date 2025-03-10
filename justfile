deploy:
    bun run build
    neocities-sync sync dist --ignore-disallowed-file-types --state .state

set dotenv-load

export EDITOR := 'nvim'

alias d := dev
alias f := fmt
alias t := test

dev:
  bun run dev

fmt:
  bun run format

test:
  bun run test

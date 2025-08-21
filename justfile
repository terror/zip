set dotenv-load

export EDITOR := 'nvim'

alias d := dev
alias f := fmt

dev:
  bun run dev

fmt:
  bun run format

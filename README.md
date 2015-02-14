## Usage

./bin/ota --file /path/to/stack.txt >> result.txt

## TODO

 * тесты
 * выпилить prefefined options

## Automator

Service - selected text
Run Shell Script
  PATH=$PATH:~/bin:/usr/local/bin
  /path/to/stacktrace/bin/ota --stack "$1" | mate

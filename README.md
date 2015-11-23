# facebook-hangman-js
A crappy console-copy-paste facebook script for in-chat facebook hangman with lots of bugs.

Generates a button for each chat window that you can press to start the game.

Just paste the script into the console! It won't save any of your personal details or infect your browser with spyware! Trust me. Truuuuuust meeeeeeeeee-

Todo:
* Fix bug with subsequent games rendering 'the game is over'
  * probably to do with the game not being destroyed and/or the mutator not being successfully disconnected
  * hacky fix could be to just..... not render that text
* Refactor some of the dirty coupling from the game
* Extract the facebook chat manipulation into its own glorious hacky API!
* Add more words or generate from an online word source
* Add clues/definitions?
* Add support for multiple words
* Work out whether I should remove redundant functions
* Wonder if I should have just used object prototyped functions after all
* Stop coding this terrible terrible game or at least use a decent goddamn UI like an IRC bot
* Go viral with the best Hangman ever made
* Create something fun
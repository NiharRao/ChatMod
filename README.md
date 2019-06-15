# ChatMod
A discord bot for simple chat moderation (delete specific number of recent messages sent by specific user)

Commands:
1. !purge N
	- N represents an integer. This allows a user with administrator permissions to purge N recent messages in the channel the command is used in. 

2. !purge N @user
	- Same command, but this specifies to purge the messages only from the mentioned user.
	
3. !filter show
	- shows status of message filter (enabled or disabled) and displays a list of banned words.

4. !filter enable
	- enables the chat filter (deletes messages that contain words from the filter list and replies to the user with a warning).
	
5. !filter disable
	- disables the chat filter.

6. !filter add <word>
	- adds <word> to the filter list.
	
7. !filter remove <word>
	- removes <word> from the filter list.
PROJECT RULE FOR AI(PLEASE ADHERE STRICTLY!)

1. NEVER kill all node before running run dev as other port might be used for other projects
2. check .env to see what port is registered to oauth and use that for development (default is 3000)
3. check package.json to see dev build automated npm run dev and user that
4. check the whole project to get a glimpse of what needs doing before first edit/coding
5. NEVER commit without confirming user
6. ALWAYS protect secrets NEVER EVER HARDCODE SECRETS IN CODE
7. ALWAYS use .env for secrets
8. ALWAYS add to .gitignore all .env files
9. ALWAYS CHECK FOR SECRETS BEFORE ANY COMMIT
10. ALWAYS ask for commit message to user before commiting
11. ALWAYS skip scanning node_modules and .next or any other files that are not part of the project
12. check notes or notes-to-ai folder for any important notes addresed to AI
13. datas in database are important NEVER wipe database or format or anything that bulk edit database without confirming user
14. if when editing any command or edit or commit is against any rule in here confirm with user before proceeding
15. if you need to create external files such as test and other kind of scripts, create in a folder name 'test-script' in 'root'. then put the folder in gitignore and make sure it is not commited

@echo off

if [%1]==[] goto :end
set message=%1
git add .
git commit -am %message%
git push
goto :eof 
:end
echo  Error: Commit message is missing

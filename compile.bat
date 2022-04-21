@echo off
cd apps & call compile.bat & cd .. 
cd auth & call compile.bat & cd .. 
cd booking & call compile.bat & cd .. 
cd documents & call compile.bat & cd .. 
REM cd inventory & call compile.bat & cd .. 
cd settings & call compile.bat & cd ..
cd sale & call compile.bat & cd ..
cd pos & call compile.bat & cd ..

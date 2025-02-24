@echo off
start cmd /k "cd /d %cd%\client && npm run dev"
start cmd /k "cd /d %cd%\server && npm run dev"

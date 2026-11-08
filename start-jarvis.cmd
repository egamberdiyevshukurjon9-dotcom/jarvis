@echo off
rem J.A.R.V.I.S. - starts the brain and the face, then opens Chrome.
title J.A.R.V.I.S.
cd /d "%~dp0"
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 8; $u='http://localhost:5173'; try { Start-Process chrome $u -ErrorAction Stop } catch { try { Start-Process msedge $u -ErrorAction Stop } catch { Start-Process $u } }"
call npm.cmd start
pause

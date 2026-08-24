# PowerShell'de venv aktivasyonu (.venv\Scripts\Activate.ps1) execution-policy sorunlarina
# takilabiliyor - venv'i hic aktive etmeden dogrudan .venv icindeki python.exe'yi cagirmak
# guvenilir cozum (bkz. Documents/Staj_Defteri_Raporu.md, 19. gun).
Set-Location $PSScriptRoot
& ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload

Option Explicit

Const ppSaveAsPDF = 32

Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count < 1 Then
  WScript.Echo "Usage: cscript //nologo convert-preset-pptx-to-pdf.vbs <source-folder> [file-name]"
  WScript.Quit 1
End If

Dim sourceFolderPath
sourceFolderPath = WScript.Arguments(0)

If Not fso.FolderExists(sourceFolderPath) Then
  WScript.Echo "Source folder not found: " & sourceFolderPath
  WScript.Quit 1
End If

Dim targetFileName
targetFileName = ""
If WScript.Arguments.Count >= 2 Then
  targetFileName = WScript.Arguments(1)
End If

Dim sourceFolder
Set sourceFolder = fso.GetFolder(sourceFolderPath)

Dim powerpoint
Set powerpoint = CreateObject("PowerPoint.Application")

On Error Resume Next

Dim file
For Each file In sourceFolder.Files
  If LCase(fso.GetExtensionName(file.Name)) = "pptx" Then
    If targetFileName = "" Or StrComp(file.Name, targetFileName, 0) = 0 Then
      Dim pdfPath
      pdfPath = fso.BuildPath(sourceFolderPath, fso.GetBaseName(file.Name) & ".pdf")

      Dim presentation
      Set presentation = Nothing
      Err.Clear
      Set presentation = powerpoint.Presentations.Open(file.Path, False, False, True)
      If Err.Number <> 0 Then
        WScript.Echo "OPEN_FAIL|" & CStr(Err.Number) & "|" & file.Name & "|" & Err.Description
        Err.Clear
      Else
        presentation.SaveAs pdfPath, ppSaveAsPDF
        If Err.Number <> 0 Then
          WScript.Echo "SAVE_FAIL|" & CStr(Err.Number) & "|" & file.Name & "|" & Err.Description
          Err.Clear
        Else
          WScript.Echo "OK|" & file.Name
        End If
        presentation.Close
        Set presentation = Nothing
      End If
    End If
  End If
Next

powerpoint.Quit
Set powerpoint = Nothing

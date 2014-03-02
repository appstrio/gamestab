let b:files = split(globpath('.', '*.jpg'), '\n')
for f in b:files
    let f = fnamemodify(f,':t')
    let b:exec_command = "!convert " . f . ' -scale 100x100\! -extent 100x100 -quality 50 -unsharp 0x\.5 thumbnails/' . f
    silent exec b:exec_command
endfor



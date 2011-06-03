set source=..\w3help\zh-cn\causes\
set dest=..\w3help\zh-cn\output\
set template=..\w3help\zh-cn\causes\template_cause.html
set idlist=id_list.txt
set csdnlist=csdn_list.txt
cd %~dp0
mkdir %dest%
cscript //nologo build_root_cause.js %source% %dest% %template% %idlist% %csdnlist%

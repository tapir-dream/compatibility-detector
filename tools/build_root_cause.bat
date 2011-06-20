set type=RCA
set source=..\w3help\zh-cn\causes\
set dest=w3help\zh-cn\output\causes\
set template=..\w3help\zh-cn\causes\template_cause.html
set idlist=RCA_id_list.txt
set csdnlist=csdn_list.txt
cd %~dp0
mkdir %dest%
cscript //nologo build_articles.js %type% %source% %dest% %template% %idlist% %csdnlist%

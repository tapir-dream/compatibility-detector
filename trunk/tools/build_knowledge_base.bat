set type=KB
set source=..\w3help\zh-cn\kb\
set dest=w3help\zh-cn\output\kb\
set template=..\w3help\zh-cn\kb\template_kb.html
set idlist=KB_id_list.txt
cd %~dp0
mkdir %dest%
node build_articles.js %type% %source% %dest% %template% %idlist% null

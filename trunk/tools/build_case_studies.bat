set type=CS
set source=..\w3help\zh-cn\casestudies\
set dest=w3help\zh-cn\output\casestudies\
set template=..\w3help\zh-cn\casestudies\template_casestudies.html
set idlist=CS_id_list.txt
cd %~dp0
mkdir %dest%
node build_articles.js %type% %source% %dest% %template% %idlist% null

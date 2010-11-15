#!/bin/sh

if [ ! -x /usr/bin/fromdos ]; then
  Installing tofrodos
  sudo apt-get install tofrodos
fi

for lc in zh-cn; do
  curl --user reviewer:w3help http://www.w3help.org/$lc/causes/index.html 2>/dev/null |
      fromdos | grep 'li class="item"' | sed 's/<[^>]*>//g;s/^\s*//;s/\s$//' > cause_index
  echo 'var issueIds = ['
  awk '{
    typeid = substr($0, 0, 6);
    print "  '\''" typeid "'\'',";
  }' < cause_index
  echo '];'
  awk '{
    typeid = substr($0, 0, 6);
    message = substr($0, 8);
    sub(/^ */, "", message);
    gsub("\"", "\\\"", message);
    gsub("&lt;", "<", message);
    gsub("&gt;", ">", message);
    gsub("&quot;", "\\\"", message);
    gsub("&amp;", "\\&", message);
    print "  \"" typeid "\": { \"message\": \"" message "\" },";
  }' < cause_index
  for typeid in `cut -c 1-6 cause_index`; do
    curl --user reviewer:w3help http://www.w3help.org/$lc/causes/$typeid 2>/dev/null |
        fromdos | awk '/h2 id="solutions"/ {
          while (1) {
            getline;
            sub(/^[[:space:]]*/, "", $0);
            gsub(/<[^>]*>/, "", $0);
            gsub("\"", "\\\"", $0);
            gsub("&lt;", "<", $0);
            gsub("&gt;", ">", $0);
            gsub("&quot;", "\\\"", $0);
            gsub("&amp;", "\\&", $0);
            sub(/^[[:space:]]*/, "", $0);
            if ($0) {
              print "  \"'$typeid'_suggestion\": { \"message\": \"" $0 "\" },";
              nextfile;
              break;
            }
          }
        }'
  done
done


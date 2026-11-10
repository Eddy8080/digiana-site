FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY Digiana_Empresarial_identidade_1.html /usr/share/nginx/html/
COPY politica-de-privacidade.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY llms.txt /usr/share/nginx/html/
COPY "DigiAna - Icone.png" /usr/share/nginx/html/
COPY favicon.png /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

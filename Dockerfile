FROM nginx:alpine

# Remove página padrão e copia arquivos estáticos
RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/
COPY politica-de-privacidade.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

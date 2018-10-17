FROM node

WORKDIR /home/src  

COPY . /home/src
 
#因为install 过就不执行
#RUN cd /home/src; npm install

#这里要使用 docker run --link 添加连接到其他container,如果有单独数据库的话
 
#暴露3000port 
EXPOSE 3000
 
CMD ["npm","start"]
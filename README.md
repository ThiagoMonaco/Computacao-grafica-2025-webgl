# Computacao-grafica-2025-webgl

Esse repósitorio possui o trabalho de Grau B da cadeira de Computação Gráfica da Unisinos (2025/1)

Alunos: Evelyn Tag, Pedro Fleck e Thiago Mônaco

Caso não queira executar o projeto localmente, é possível acessar ele através de:
https://computacao-grafica-2025-webgl.vercel.app/

## Para rodar o projeto:

### Docker
No root do projeto, faça o build do dockerfile
```
docker build -t webgl2 .
```
Após isso, execute a imagem docker

```
docker run --rm -p 8080:80 webgl2
```

E pronto! agora é possivel acessar o projeto através do http://localhost:8080

### Executar localmente como dev
Tenha o node instalado pelo menos na versão 22.11.0

No root do projeto:
```
npm i
```
Após isso:
```
npm run dev
```
Acesse o localhost na porta indicada através do navegador

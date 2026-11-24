
import { TOKENS } from "./tokens.js";

export function analisarSintatico(tokens) {
    let posicao = 0;

    // Retorna o token atual
    function atual() {
        return tokens[posicao];
    }

    // Avança para o próximo token
    function avancar() {
        const token = atual();
        posicao++;
        return token;
    }

    // Verifica se o token atual é do tipo esperado
    function esperar(tipo) {
        if (atual().tipo !== tipo) {
            const encontrado = atual();

            throw new Error(
                `Erro sintático na linha ${encontrado.linha}: ` +
                `esperado ${tipo}, encontrado "${encontrado.lexema}"`
            );
        }

        return avancar();
    }

    // Lê um número
    function lerNumero() {
        return esperar(TOKENS.NUMERO).valor;
    }

    // Lê uma cor
    function lerCor() {
        return esperar(TOKENS.COR).lexema;
    }

    // Analisa o programa inteiro
    function parsePrograma() {
        // A declaração da tela é obrigatória e deve ser a primeira
        esperar(TOKENS.TELA);

        const largura = lerNumero();
        const altura = lerNumero();

        const formas = [];

        while (atual().tipo !== TOKENS.EOF) {
            formas.push(parseElemento());
        }

        esperar(TOKENS.EOF);

        return {
            tipo: "Programa",
            tela: {
                largura: largura,
                altura: altura
            },
            elementos: formas
        };
    }

    // Decide qual elemento será analisado
    function parseElemento() {
        switch (atual().tipo) {
            case TOKENS.LINHA:
            case TOKENS.CIRCULO:
            case TOKENS.RETANGULO:
                return parseForma();

            case TOKENS.GRUPO:
                return parseGrupo();

            default:
                throw new Error(
                    `Erro sintático na linha ${atual().linha}: ` +
                    `esperado uma forma ou grupo, encontrado "${atual().lexema}"`
                );
        }
    }

    // Analisa as formas geométricas
    function parseForma() {
        const token = avancar();

        let campos = {};

        if (token.tipo === TOKENS.LINHA) {
            campos = {
                x1: lerNumero(),
                y1: lerNumero(),
                x2: lerNumero(),
                y2: lerNumero()
            };
        }

        if (token.tipo === TOKENS.CIRCULO) {
            campos = {
                x: lerNumero(),
                y: lerNumero(),
                raio: lerNumero()
            };
        }

        if (token.tipo === TOKENS.RETANGULO) {
            campos = {
                x: lerNumero(),
                y: lerNumero(),
                largura: lerNumero(),
                altura: lerNumero()
            };
        }

        const estilos = parseEstilos();

        return {
            tipo: token.lexema,
            ...campos,
            estilos: estilos
        };
    }

    // Analisa os atributos opcionais das formas
    function parseEstilos() {
        const estilos = {};

        while (
            atual().tipo === TOKENS.TRACO ||
            atual().tipo === TOKENS.PREENCHIMENTO ||
            atual().tipo === TOKENS.ESPESSURA
        ) {
            const token = avancar();

            if (token.tipo === TOKENS.TRACO) {
                if (estilos.traco !== undefined) {
                    throw new Error(
                        `Atributo traco repetido na linha ${token.linha}`
                    );
                }

                estilos.traco = lerCor();
            }

            else if (token.tipo === TOKENS.PREENCHIMENTO) {
                if (estilos.preenchimento !== undefined) {
                    throw new Error(
                        `Atributo preenchimento repetido na linha ${token.linha}`
                    );
                }

                estilos.preenchimento = lerCor();
            }

            else if (token.tipo === TOKENS.ESPESSURA) {
                if (estilos.espessura !== undefined) {
                    throw new Error(
                        `Atributo espessura repetido na linha ${token.linha}`
                    );
                }

                estilos.espessura = lerNumero();
            }
        }

        return estilos;
    }

    // Analisa os grupos, inclusive grupos aninhados
    function parseGrupo() {
        esperar(TOKENS.GRUPO);

        const modificadores = [];

        // Um grupo pode possuir rotação e deslocamento
        while (
            atual().tipo === TOKENS.ROTACAO ||
            atual().tipo === TOKENS.DESLOCAMENTO
        ) {
            const token = avancar();

            if (token.tipo === TOKENS.ROTACAO) {
                modificadores.push({
                    tipo: "rotacao",
                    angulo: lerNumero()
                });
            }

            else {
                modificadores.push({
                    tipo: "deslocamento",
                    x: lerNumero(),
                    y: lerNumero()
                });
            }
        }

        esperar(TOKENS.ABRE_COLCHETE);

        const elementos = [];

        while (
            atual().tipo !== TOKENS.FECHA_COLCHETE &&
            atual().tipo !== TOKENS.EOF
        ) {
            elementos.push(parseElemento());
        }

        esperar(TOKENS.FECHA_COLCHETE);

        return {
            tipo: "Grupo",
            modificadores: modificadores,
            elementos: elementos
        };
    }

    // Inicia a análise e retorna a AST
    try {
        const ast = parsePrograma();

        return {
            sucesso: true,
            ast: ast,
            erro: null
        };

    } catch (erro) {
        return {
            sucesso: false,
            ast: null,
            erro: erro.message
        };
    }
}

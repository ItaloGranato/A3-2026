
import { TOKENS } from "./tokens.js";

// Palavras reservadas da linguagem
const PALAVRAS = {
    tela: TOKENS.TELA,
    linha: TOKENS.LINHA,
    circulo: TOKENS.CIRCULO,
    retangulo: TOKENS.RETANGULO,
    grupo: TOKENS.GRUPO,
    traco: TOKENS.TRACO,
    preenchimento: TOKENS.PREENCHIMENTO,
    espessura: TOKENS.ESPESSURA,
    rotacao: TOKENS.ROTACAO,
    deslocamento: TOKENS.DESLOCAMENTO
};

// Cores aceitas pela linguagem
const CORES = [
    "azul",
    "vermelho",
    "verde",
    "amarelo",
    "preto",
    "branco",
    "roxo"
];

export function analisarLexico(codigo) {
    const tokens = [];
    const erros = [];

    let posicao = 0;
    let linha = 1;

    // Percorre todo o código
    while (posicao < codigo.length) {
        const caractere = codigo[posicao];

        // Ignora espaços
        if (caractere === " " || caractere === "\t" || caractere === "\r") {
            posicao++;
            continue;
        }

        // Conta as linhas
        if (caractere === "\n") {
            linha++;
            posicao++;
            continue;
        }

        // Ignora comentários iniciados por //
        if (codigo.startsWith("//", posicao)) {
            while (
                posicao < codigo.length &&
                codigo[posicao] !== "\n"
            ) {
                posicao++;
            }
            continue;
        }

        // Reconhece colchete de abertura
        if (caractere === "[") {
            tokens.push({
                tipo: TOKENS.ABRE_COLCHETE,
                lexema: "[",
                linha: linha
            });

            posicao++;
            continue;
        }

        // Reconhece colchete de fechamento
        if (caractere === "]") {
            tokens.push({
                tipo: TOKENS.FECHA_COLCHETE,
                lexema: "]",
                linha: linha
            });

            posicao++;
            continue;
        }

        // Reconhece cores hexadecimais (#RRGGBB)
        if (caractere === "#") {
            const trecho = codigo.slice(posicao);
            const resultado = trecho.match(/^#[0-9a-fA-F]{6}/);

            if (resultado) {
                tokens.push({
                    tipo: TOKENS.COR,
                    lexema: resultado[0],
                    linha: linha
                });

                posicao += resultado[0].length;
                continue;
            }
        }

        // Reconhece números inteiros sem sinal
        const trechoAtual = codigo.slice(posicao);
        const numero = trechoAtual.match(/^\d+/);

        if (numero) {
            tokens.push({
                tipo: TOKENS.NUMERO,
                lexema: numero[0],
                valor: Number(numero[0]),
                linha: linha
            });

            posicao += numero[0].length;
            continue;
        }

        // Reconhece palavras         |          caracteres aceitos
        const palavra = trechoAtual.match(/^[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*/);

        if (palavra) {
            const lexema = palavra[0];

            // Verifica se é palavra reservada
            if (PALAVRAS[lexema]) {
                tokens.push({
                    tipo: PALAVRAS[lexema],
                    lexema: lexema,
                    linha: linha
                });

                posicao += lexema.length;
                continue;
            }

            // Verifica se é uma cor
            if (CORES.includes(lexema)) {
                tokens.push({
                    tipo: TOKENS.COR,
                    lexema: lexema,
                    linha: linha
                });

                posicao += lexema.length;
                continue;
            }
        }

        // Caso encontre algo inválido
        let trechoInvalido = "";

        while (
            posicao < codigo.length &&
            !/\s/.test(codigo[posicao])
        ) {
            // Para antes de um delimitador reconhecido
            if (codigo[posicao] === "[" || codigo[posicao] === "]") {
                break;
            }

            trechoInvalido += codigo[posicao];
            posicao++;
        }

        // Evita ficar preso caso encontre um caractere isolado
        if (trechoInvalido === "") {
            trechoInvalido = codigo[posicao];
            posicao++;
        }

        erros.push({
            linha: linha,
            trecho: trechoInvalido,
            mensagem: `Trecho inválido: "${trechoInvalido}"`
        });
    }

    // Marca o fim do código
    tokens.push({
        tipo: TOKENS.EOF,
        lexema: "EOF",
        linha: linha
    });

    return {
        tokens: tokens,
        erros: erros
    };
}

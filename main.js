
import { analisarLexico } from "./lexer.js";

// Elementos da página
const campoCodigo = document.getElementById("codigo");
const botaoExecutar = document.getElementById("executar");
const resultadoTokens = document.getElementById("tokens");
const resultadoErros = document.getElementById("erros");

// Analisa o conteúdo do campo
botaoExecutar.addEventListener("click", () => {

    const codigo = campoCodigo.value;

    // Executa o Lexer
    const resultado = analisarLexico(codigo);

    // Mostra os tokens encontrados
    resultadoTokens.textContent = JSON.stringify(
        resultado.tokens,
        null,
        4
    );

    // Mostra os erros encontrados
    if (resultado.erros.length > 0) {
        resultadoErros.textContent = JSON.stringify(
            resultado.erros,
            null,
            4
        );
    } else {
        resultadoErros.textContent = "Nenhum erro léxico encontrado!";
    }
});

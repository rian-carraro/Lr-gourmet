/*
===============================
SCRIPT DE TAXA DE ENTREGA LR Gourmet
===============================
Este arquivo controla o cálculo da taxa de entrega com base no CEP informado pelo cliente.
Comentários úteis foram adicionados para facilitar manutenção por iniciantes.
Cada função tem um comentário explicando seu propósito.
Se você for iniciante, procure os comentários para entender cada parte!
*/

// Valor fixo da taxa de entrega para Jaú/SP
const TAXA_ENTREGA_JAU = 10.00;

// Converte CEP para número inteiro
function cepParaNumero(cep) {
    return parseInt(cep.replace(/\D/g, ''), 10);
}

// Verifica se o CEP pertence à cidade de Jaú/SP
function validarCEPJau(cep) {
    const cepNumero = cepParaNumero(cep);
    // Faixa de CEPs de Jaú: 17200-001 a 17229-999
    return cepNumero >= 17200001 && cepNumero <= 17229999;
}

// Calcula a taxa de entrega com base no CEP informado
function calcularTaxaEntrega(cep) {
    // Valida se o CEP é válido (apenas números)
    const cepNumero = cepParaNumero(cep);
    if (isNaN(cepNumero) || cep.replace(/\D/g, '').length !== 8) {
        return {
            erro: "CEP inválido. Digite um CEP com 8 dígitos.",
            taxa: null
        };
    }

    // Verifica se o CEP é de Jaú
    if (!validarCEPJau(cep)) {
        return {
            erro: "CEP não atendido. Realizamos entregas apenas em Jaú/SP.",
            taxa: null
        };
    }

    // Retorna taxa fixa para qualquer CEP de Jaú
    return {
        taxa: TAXA_ENTREGA_JAU,
        mensagem: "Taxa de entrega para Jaú/SP"
    };
}
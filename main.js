var tradeSection = document.getElementById('trade-section')
var createNewTradeBtn = document.querySelector('#add-trade-btn')
var deleteTradebtn = document.querySelector('#delete-trade-btn')

document.getElementById('create-pool-btn').addEventListener('click', createPool)
createNewTradeBtn.addEventListener('click', createTrade)
document.querySelector('.token0.trade-amount input').addEventListener('change', showResult)
document.getElementById('delete-trade-btn').addEventListener('click', deleteTrade)

var pool = new Map()
var tokens = ['A', 'B']


function createPool() {
    // Show Trade info section
    tradeSection.style.display = 'block';
    tradeSection.querySelector('.token0.trade-amount input').value = 0
    createNewTradeBtn.style.display = 'block';

    // Get token's labels
    actions = document.querySelector('#tokens')

    for (let i = 0; i < 2; i++) {
        let poolInfo = {}
        poolInfo.TokenLabel = document.querySelector(`.token${i}.input-box`).value
        if (poolInfo.TokenLabel === "") poolInfo.TokenLabel = tokens[i]

        poolInfo.Reverse = parseFloat(document.querySelector(`#reverse${i}`).value)
        pool.set(tokens[i], poolInfo)

        actions.options[i].text = poolInfo.TokenLabel
        actions.options[i].value = tokens[i]
    }
}

function createTrade() {
    var newTradeInfo = document.querySelector('.trade-info').cloneNode(true)
    newTradeInfo.querySelector('input').value = 0
    newTradeInfo.querySelector('.token1.trade-amount').style.display = 'none'
    document.querySelector('#trade-section').appendChild(newTradeInfo)

    const tradeInfoList = document.querySelectorAll('.trade-info')
    tradeInfoList.forEach(element => {
        element.querySelector('.token0.trade-amount input').addEventListener('change', showResult, false)
        element.querySelector('#delete-trade-btn').addEventListener('click', deleteTrade, false)
    })
}

function showResult(event) {
    const token0 = event.target.parentElement.querySelector('.token0.trade-amount select').value
    if (event.target.value === "") return
    const balance0 = parseFloat(event.target.value)

    const token1 = getRemainToken(token0)
    const balance1 = calBalance1(token0, balance0, token1)

    renderTradeInfo(event.target.parentElement.parentElement, token1, balance1)
    renderPriceChange()
}

function deleteTrade(event) {
    if (document.querySelectorAll('.trade-info').length == 1) return

    event.target.parentElement.remove()
    renderPriceChange()
}


function renderTradeInfo(element, token1, balance1) {
    token1Element = element.querySelector('.token1.trade-amount')
    token1Element.querySelector('.amount').innerText = balance1.toFixed(4)
    token1Element.querySelector('.token').innerText = pool.get(token1).TokenLabel
    token1Element.style.display = 'inline-block'
}

function renderPriceChange() {
    const tradeInfoList = document.querySelectorAll('.trade-info')
    var lastReverses = new Map([
        [tokens[0], pool.get(tokens[0]).Reverse],
        [tokens[1], pool.get(tokens[1]).Reverse],
    ])

    // Update Last Reverses Liquidity of Pool
    tradeInfoList.forEach(element => {
        const token0_Info = element.querySelector('.token0.trade-amount')
        const token1_Info = element.querySelector('.token1.trade-amount')

        let token0 = token0_Info.querySelector('select').value
        let token1 = getRemainToken(token0)

        let balance0 = parseFloat(token0_Info.querySelector('input').value)
        let balance1 = parseFloat(token1_Info.querySelector('.amount').innerText)

        lastReverses.set(token0, lastReverses.get(token0) + balance0)
        lastReverses.set(token1, lastReverses.get(token1) + balance1)

        element.querySelector('.pool-reverses').
            querySelector('.token0').innerText = `${lastReverses.get(token0).toFixed(2)} ${pool.get(token0).TokenLabel}`
        element.querySelector('.pool-reverses').
            querySelector('.token1').innerText = `${lastReverses.get(token1).toFixed(2)} ${pool.get(token1).TokenLabel}`
    })

    priceChanges = [
        calPriceChange(pool.get(tokens[0]).Reverse / pool.get(tokens[1]).Reverse, lastReverses.get(tokens[0]) / lastReverses.get(tokens[1])),
        calPriceChange(pool.get(tokens[1]).Reverse / pool.get(tokens[0]).Reverse, lastReverses.get(tokens[1]) / lastReverses.get(tokens[0]))
    ]

    var changeInfo = document.querySelector('#change-info')
    priceChanges.forEach((percent, index) => {
        // Default is negative
        var percentText = percent.toFixed(2) + "%"
        var textColor = 'red'
        if (percent >= 0) {
            percentText = "+" + percentText
            textColor = 'green'
        }

        changeInfo.querySelector(`.token${index}`).querySelector('.percent').style.color = textColor
        changeInfo.querySelector(`.token${index}`).querySelector('.percent').innerText = `${pool.get(tokens[index]).TokenLabel} ${percentText}`
    })

}

// Formula: X*Y = (X+a)*(Y+b) = k       =>      b = (-aY)/(X+a)
function calBalance1(token0, balance0, token1) {
    console.log(token0, balance0, token1)
    return (-1) * (balance0 * pool.get(token1).Reverse) / (pool.get(token0).Reverse + balance0)
}

function getRemainToken(token) {
    return token === 'A' ? 'B' : 'A'
}

function calPriceChange(before, after) {
    return (-1) * (1 - before / after) * 100
}
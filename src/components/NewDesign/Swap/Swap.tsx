import React, { useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { printBN, printBNtoBN } from '@consts/utils'
import { PoolStructure } from '@invariant-labs/sdk/lib/market'
import { blurContent, unblurContent } from '@consts/uiUtils'
import { Grid, Typography, Box, CardMedia } from '@material-ui/core'
import { OutlinedButton } from '@components/NewDesign/OutlinedButton/OutlinedButton'
import Slippage from '@components/NewDesign/Swap/slippage/Slippage'
import ExchangeAmountInput from '@components/NewDesign/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import TransactionDetails from '@components/NewDesign/Swap/transactionDetails/TransactionDetails'
import { PRICE_DECIMAL } from '@consts/static'
import useStyles from './style'
import { Status } from '@reducers/solanaWallet'
import SwapArrows from '@static/svg/swap-arrows.svg'
import infoIcon from '@static/svg/info.svg'
import settingIcon from '@static/svg/settings.svg'
import { DENOMINATOR } from '@invariant-labs/sdk'

export interface SwapToken {
  balance: BN
  decimal: number
  symbol: string
  assetAddress: PublicKey
  name: string
  logoURI: string
}

export interface Pools {
  tokenX: PublicKey
  tokenY: PublicKey
  tokenXReserve: PublicKey;
  tokenYReserve: PublicKey;
  tickSpacing: number;
  sqrtPrice: {
    v: BN
    scale: number
  }
  fee: {
    val: BN,
    scale: number
  }
  exchangeRate: {
    val: BN,
    scale: number
  }
}

export interface ISwap {
  walletStatus: Status
  tokens: SwapToken[]
  pools: PoolStructure[]
  onSwap: (fromToken: PublicKey, toToken: PublicKey, amount: BN) => void
}
export const Swap: React.FC<ISwap> = ({
  walletStatus,
  tokens,
  pools,
  onSwap
}) => {
  const classes = useStyles()
  const [tokenFromIndex, setTokenFromIndex] = React.useState<number | null>(
    tokens.length ? 0 : null
  )
  const [tokenToIndex, setTokenToIndex] = React.useState<number | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [amountFrom, setAmountFrom] = React.useState<string>('')
  const [amountTo, setAmountTo] = React.useState<string>('')
  const [swap, setSwap] = React.useState<boolean | null>(null)
  const [tokensY, setTokensY] = React.useState<SwapToken[]>(tokens)
  const [poolIndex, setPoolIndex] = React.useState<number | null>(null)
  const [slippTolerance, setSlippTolerance] = React.useState<string>('')
  const [settings, setSettings] = React.useState<boolean>(false)
  const [details, setDetails] = React.useState<boolean>(false)

  const calculateSwapOutAmount = (assetIn: SwapToken, assetFor: SwapToken, amount: string) => {
    let amountOut: BN = new BN(0)
    let priceProportion = new BN(0)
    if (poolIndex !== -1 && poolIndex !== null) {
      priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
      if (+printBN(pools[poolIndex].sqrtPrice.v, PRICE_DECIMAL) < 1) {
        priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
        if (assetIn.assetAddress.equals(pools[poolIndex].tokenX)) {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(priceProportion).div(DENOMINATOR)
        } else {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(DENOMINATOR).div(priceProportion)
        }
      } else {
        priceProportion = new BN(2)
      }
    }
    if (assetFor.decimal >= assetIn.decimal) {
      const decimalChange = new BN(10).pow(new BN(assetFor.decimal - assetIn.decimal))
      return printBN(amountOut.mul(new BN(decimalChange)), assetFor.decimal)
    } else {
      const decimalChange = new BN(10).pow(new BN(assetIn.decimal - assetFor.decimal - setBalanceDecimal(assetIn.decimal)))
      return printBN(amountOut.div(new BN(decimalChange)), assetIn.decimal)
    }
  }
  const calculateSwapOutAmountTax = (assetIn: SwapToken, assetFor: SwapToken, amount: string) => {
    let amountOut: BN = new BN(0)
    let priceProportion = new BN(0)
    if (poolIndex !== -1 && poolIndex !== null) {
      priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
      if (+printBN(pools[poolIndex].sqrtPrice.v, PRICE_DECIMAL) < 1) {
        priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
        if (assetIn.assetAddress.equals(pools[poolIndex].tokenX)) {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(priceProportion).div(DENOMINATOR)
        } else {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(DENOMINATOR).div(priceProportion)
        }
      } else {
        priceProportion = new BN(2)
      }
      amountOut = amountOut.sub(
        amountOut.mul(pools[poolIndex].fee.v).div(DENOMINATOR)
      )
    }
    if (assetFor.decimal >= assetIn.decimal) {
      const decimalChange = new BN(10).pow(new BN(assetFor.decimal - assetIn.decimal))
      return printBN(amountOut.mul(new BN(decimalChange)), assetFor.decimal)
    } else {
      const decimalChange = new BN(10).pow(new BN(assetIn.decimal - assetFor.decimal - setBalanceDecimal(assetIn.decimal)))
      return printBN(amountOut.div(new BN(decimalChange)), assetIn.decimal)
    }
  }

  const calculateSwapOutAmountTaxReversed = (assetIn: SwapToken, assetFor: SwapToken, amount: string) => {
    console.log('token in: ', assetIn.decimal, 'token for: ', assetFor.decimal)
    let amountOut: BN = new BN(0)
    let priceProportion = new BN(0)
    if (poolIndex !== -1 && poolIndex !== null) {
      priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
      if (+printBN(pools[poolIndex].sqrtPrice.v, DEC) < 1) {
        priceProportion = pools[poolIndex].sqrtPrice.v.mul(pools[poolIndex].sqrtPrice.v).div(DENOMINATOR)
        if (assetIn.assetAddress.equals(pools[poolIndex].tokenX)) {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(priceProportion).div(DENOMINATOR)
        } else {
          amountOut = printBNtoBN(amount, assetIn.decimal).mul(DENOMINATOR).div(priceProportion)
        }
      } else {
        priceProportion = new BN(2)
      }
      amountOut = amountOut.add(
        amountOut.mul(pools[poolIndex].fee.v).div(new BN(10 ** PRICE_DECIMAL))
      )

      console.log('amount after fees', printBN(amountOut, 6))
    }
    if (assetFor.decimal >= assetIn.decimal) {
      console.log('for > in')
      const decimalChange = new BN(10).pow(new BN(assetFor.decimal - assetIn.decimal))
      return printBN(amountOut.mul(new BN(decimalChange)), assetFor.decimal)
    } else {
      console.log('for < in')
      console.log('asset in decimal: ', assetIn.decimal)
      console.log('balance decimal: ', setBalanceDecimal(assetIn.decimal))
      const decimalChange = new BN(10).pow(new BN(assetIn.decimal - assetFor.decimal - setBalanceDecimal(assetIn.decimal)))
      return printBN(amountOut.div(new BN(decimalChange)), assetIn.decimal)
    }
  }

  const setBalanceDecimal = (dec: number): number => {
    if (dec > 6) {
      return dec - 6
    } else if (dec === 6) {
      return 6
    } else {
      return 6 + dec
    }
  }

  const setBalanceDecimal2 = (dec: number): number => {
    if (dec > 6) {
      return dec - (dec - 6)
    } else if (dec === 6) {
      return 6
    } else {
      return dec + (dec - 6)
    }
  }
  useEffect(() => {
    updateEstimatedAmount(amountTo)
    setAmountFrom(amountTo)

    if ((tokenFromIndex !== null && tokenToIndex === null)) {
      setAmountFrom('0.000000')
    }
    if (tokenFromIndex !== null) {
      const tokensY = tokens.filter((token) => {
        return getSwapPoolIndex(token.assetAddress, tokens[tokenFromIndex].assetAddress) !== -1
      })
      setTokensY(tokensY)
    }
    if (tokenToIndex !== null && tokenFromIndex !== null) {
      const pairIndex = pools.findIndex((pool) => {
        return (
          tokens[tokenFromIndex].assetAddress.equals(pool.tokenX) &&
          tokens[tokenToIndex].assetAddress.equals(pool.tokenY)) ||
          (tokens[tokenToIndex].assetAddress.equals(pool.tokenX) &&
          tokens[tokenFromIndex].assetAddress.equals(pool.tokenY))
      })
      setPoolIndex(pairIndex)
    }
  }, [tokenToIndex, tokenFromIndex, pools.length])

  // useEffect(() => {
  //   swap ? setTokenToIndex(tokenToIndex) : setTokenToIndex(null)
  // }, [tokenFromIndex])

  // useEffect(() => {
  //   swap ? setTokenFromIndex(null) : setTokenFromIndex(tokenFromIndex)
  // }, [tokenToIndex])
  const getSwapPoolIndex = (fromToken: PublicKey, toToken: PublicKey) => {
    return pools.findIndex((pool) => {
      return (
        (pool.tokenX.equals(fromToken) &&
        pool.tokenY.equals(toToken)) ||
        (pool.tokenX.equals(toToken) &&
        pool.tokenY.equals(fromToken)))
    })
  }
  const getIsXToY = (fromToken: PublicKey, toToken: PublicKey) => {
    const swapPool = pools.find(
      pool =>
        (fromToken.equals(pool.tokenX) &&
          toToken.equals(pool.tokenY)) ||
        (fromToken.equals(pool.tokenY) &&
          toToken.equals(pool.tokenX))
    )
    return !!swapPool
  }
  const updateEstimatedAmount = (amount: string | null = null) => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      setAmountTo(
        calculateSwapOutAmountTax(tokens[tokenFromIndex], tokens[tokenToIndex], amount ?? amountTo)
      )
      console.log('To input amount', calculateSwapOutAmountTax(tokens[tokenFromIndex], tokens[tokenToIndex], amount ?? amountTo))
    }
  }
  const updateFromEstimatedAmount = (amount: string | null = null) => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      setAmountFrom(
        calculateSwapOutAmountTaxReversed(tokens[tokenFromIndex], tokens[tokenToIndex], amount ?? amountFrom)
      )
    }
  }

  const getButtonMessage = () => {
    if (walletStatus !== Status.Initialized) {
      return 'Please connect wallet'
    }

    if (tokenFromIndex === null || tokenToIndex === null) {
      return 'Swap tokens'
    }

    if (!getIsXToY(tokens[tokenFromIndex].assetAddress, tokens[tokenToIndex].assetAddress)) {
      return 'Pair does not exist'
    }

    if (
      printBNtoBN(amountFrom, tokens[tokenFromIndex].decimal).eqn(0)
    ) {
      return 'Insufficient trade volume'
    }
    if (printBNtoBN(amountFrom, tokens[tokenFromIndex].decimal).gt(
      printBNtoBN(printBN(tokens[tokenFromIndex].balance, 6), tokens[tokenFromIndex].decimal))) {
      return 'Insufficient balance'
    }
    return 'Swap'
  }

  const setSlippage = (slippage: string): void => {
    setSlippTolerance(slippage)
  }

  const handleClickSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setSettings(true)
  }

  const hoverDetails = () => {
    setDetails(!details)
  }

  const handleCloseSettings = () => {
    unblurContent()
    setSettings(false)
  }
  return (
    <Grid container className={classes.swapWrapper}>
      <Grid container className={classes.header}>
        <Typography component='h1'>Swap tokens</Typography>
        <CardMedia image={settingIcon} className={classes.settingsIcon} onClick={handleClickSettings}/>
        <Grid className={classes.slippage}>
          <Slippage open={settings}
            setSlippage={setSlippage}
            handleClose={handleCloseSettings}
            anchorEl={anchorEl}
            defaultSlippage={'1'}/>
        </Grid>
      </Grid>
      <Grid container className={classes.root} direction='column'>
        <Box className={classes.tokenComponentTextContainer}>
          <Typography className={classes.tokenComponentText}>Est.: </Typography>
          <Typography className={classes.tokenComponentText}>
          Balance: {tokenFromIndex !== null
              ? printBN(tokens[tokenFromIndex].balance, setBalanceDecimal2(tokens[tokenFromIndex].decimal)) : '0'}
          </Typography>
        </Box>
        <ExchangeAmountInput
          value={amountFrom}
          className={classes.amountInput}
          style={{ transform: swap !== null ? swap ? 'translateY(0px)' : 'translateY(0px)' : '' }}
          setValue={value => {
            if (value.match(/^\d*\.?\d*$/)) {
              setAmountFrom(value)
              updateEstimatedAmount(value)
            }
          }}
          placeholder={'0.0'}
          onMaxClick={() => {
            if (tokenToIndex !== null && tokenFromIndex !== null) {
              setAmountFrom(printBN(tokens[tokenFromIndex].balance, setBalanceDecimal2(tokens[tokenFromIndex].decimal)))
              updateEstimatedAmount(printBN(tokens[tokenFromIndex].balance, setBalanceDecimal2(tokens[tokenFromIndex].decimal)))
            }
          }}
          tokens={ tokens }
          current={
            tokenFromIndex !== null
              ? tokens[tokenFromIndex]
              : null}
          onSelect={(name: string) => {
            setTokenFromIndex(
              tokens.findIndex((token) => {
                return name === token.symbol
              })
            )
          }}
        />
        <Box className={classes.tokenComponentTextContainer}>
          <Box className={classes.swapArrowBox}>
            <CardMedia image={SwapArrows}
              style={
                {
                  transform: swap !== null
                    ? swap
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)'
                    : ''
                }
              }
              className={classes.swapArrows} onClick={() => {
                if (tokenToIndex !== null) {
                  swap !== null
                    ? setSwap(!swap)
                    : setSwap(true)
                }
                const tmp = tokenFromIndex
                const tokensTmp = tokens
                setTokenFromIndex(tokenToIndex)
                setTokenToIndex(tmp)
                tokens = tokensY
                setTokensY(tokensTmp)
              }} />
          </Box>
          <Typography className={classes.tokenComponentText}>To (Estd.)</Typography>
          <Typography className={classes.tokenComponentText}>
          Balance: {tokenToIndex !== null
              ? printBN(tokens[tokenToIndex].balance, setBalanceDecimal2(tokens[tokenToIndex].decimal)) : '0'}
          </Typography>
        </Box>
        <ExchangeAmountInput
          value={amountTo}
          className={classes.amountInput}
          style={
            {
              transform: swap !== null
                ? swap
                  ? 'translateY(0px)'
                  : 'translateY(0px)'
                : ''
            }
          }
          setValue={value => {
            if (value.match(/^\d*\.?\d*$/)) {
              setAmountTo(value)
              updateFromEstimatedAmount(value)
            }
          }}
          placeholder={'0.0'}
          onMaxClick={() => {
            if (tokenToIndex !== null && tokenFromIndex !== null) {
              setAmountFrom(printBN(tokens[tokenFromIndex].balance, setBalanceDecimal2(tokens[tokenFromIndex].decimal)))
              updateEstimatedAmount(printBN(tokens[tokenFromIndex].balance, setBalanceDecimal2(tokens[tokenFromIndex].decimal)))
            }
          }}
          tokens={ tokensY }
          current={
            tokenToIndex !== null
              ? tokens[tokenToIndex]
              : null}
          onSelect={(name: string) => {
            setTokenToIndex(
              tokens.findIndex((token) => {
                return name === token.symbol
              }))
            updateEstimatedAmount()
          }}
        />
        <Box className={classes.transactionDetails}>
          <Grid className={classes.transactionDetailsWrapper} onMouseEnter={hoverDetails} onMouseLeave={hoverDetails}>
            <Typography className={classes.transactionDetailsHeader}>See transaction details</Typography>
            <CardMedia image={infoIcon} style={{ width: 10, height: 10, marginLeft: 4 }}/>
          </Grid>
          {tokenFromIndex !== null && tokenToIndex !== null && getButtonMessage() === 'Swap'
            ? <TransactionDetails
              open={details}
              fee={{ v: poolIndex !== -1 && poolIndex !== null ? pools[poolIndex].fee.v : new BN(0) }}
              exchangeRate={{
                val: calculateSwapOutAmount(tokens[tokenFromIndex], tokens[tokenToIndex], '1'),
                symbol: tokens[tokenToIndex].symbol
              }}
            />
            : null}
          {tokenFromIndex !== null && tokenToIndex !== null && getButtonMessage() === 'Swap' ? (
            <Typography className={classes.rateText}>
          1 {tokens[tokenFromIndex].symbol } = {' '}
              {calculateSwapOutAmount(tokens[tokenFromIndex], tokens[tokenToIndex], '1')}{' '}
              {tokens[tokenToIndex].symbol}
            </Typography>
          ) : null}
        </Box>
        <OutlinedButton
          name={getButtonMessage()}
          color='secondary'
          className={classes.swapButton}
          disabled={getButtonMessage() !== 'Swap'}
          onClick={() => {
            if (tokenFromIndex === null || tokenToIndex === null) return

            onSwap(
              tokens[tokenFromIndex].assetAddress,
              tokens[tokenToIndex].assetAddress,
              printBNtoBN(amountFrom, tokens[tokenFromIndex].decimal)
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

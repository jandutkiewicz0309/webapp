import React from 'react'
import { Grid, Typography, Box, useMediaQuery } from '@material-ui/core'
import useStyle from './style'
import { colors, theme } from '@static/theme'
import { formatNumbers, showPrefix } from '@consts/utils'
interface IProps {
  TVL?: string
  volume?: string
  fee?: string
  displayType: string
  symbolFrom?: string
  symbolTo?: string
  iconFrom?: string
  iconTo?: string
  tokenIndex?: number
}

const PoolListItem: React.FC<IProps> = ({
  fee = '0',
  volume = '0',
  TVL = '0',
  displayType,
  symbolFrom,
  symbolTo,
  iconFrom,
  iconTo,
  tokenIndex
}) => {
  const classes = useStyle()

  const isXDown = useMediaQuery(theme.breakpoints.down('sm'))
  const hideTokenImage = useMediaQuery(theme.breakpoints.down('xs'))

  return (
    <Grid>
      {displayType === 'token' ? (
        <Grid
          container
          classes={{ container: classes.container, root: classes.header }}
          style={{ color: colors.white.main }}>
          <Typography>{tokenIndex}</Typography>
          <Grid className={classes.imageContainer}>
            {!hideTokenImage && (
              <Box>
                <img src={iconFrom} />
                <img src={iconTo} />
              </Box>
            )}
            <Box className={classes.symbolsContainer}>
              <Typography>
                {symbolFrom}/{symbolTo}
              </Typography>
            </Box>
          </Grid>
          <Typography>{fee}%</Typography>
          <Typography>
            {isXDown
              ? `~$${formatNumbers()(volume.replace(/[,.]/g, ''))} ${showPrefix(
                  Number(volume.split(',').join(''))
                )}`
              : `$${volume}`}
          </Typography>
          <Typography>
            {isXDown
              ? `~$${formatNumbers()(TVL.replace(/[,.]/g, ''))} ${showPrefix(
                  Number(TVL.split(',').join(''))
                )}`
              : `$${TVL}`}
          </Typography>
        </Grid>
      ) : (
        <Grid container classes={{ container: classes.container, root: classes.header }}>
          <Typography style={{ lineHeight: '11px' }}>
            N<sup>o</sup>
          </Typography>
          <Grid>
            <Typography>Name</Typography>
          </Grid>
          <Typography>fee</Typography>
          <Typography>Volume 24H</Typography>
          <Typography>TVL</Typography>
        </Grid>
      )}
    </Grid>
  )
}

export default PoolListItem

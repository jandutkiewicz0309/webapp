import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { toBlur } from '@consts/uiUtils'
import { BN } from '@project-serum/anchor'
import TransactionDetails from '@components/Swap/transactionDetails/TransactionDetails'
import React from 'react'

storiesOf('newUi/swap', module)
  .addDecorator(withKnobs)
  .add('transaction details', () => (
    <div style={{ width: 800 }} id={toBlur}>
      <TransactionDetails
        open={true}
        fee={{ v: new BN(1000) }}
        exchangeRate={{ val: 0.4321, symbol: 'SNY' }}
        anchorTransaction={null}
        decimal={6}
        handleCloseTransactionDetails={() => {}}
      />
    </div>
  ))

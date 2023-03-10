const createBox = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l12
txn OnCompletion
int DeleteApplication
==
bnz main_l11
txn OnCompletion
int UpdateApplication
==
bnz main_l10
txn OnCompletion
int OptIn
==
bnz main_l9
txn OnCompletion
int CloseOut
==
bnz main_l8
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
int 0
return
main_l8:
int 0
return
main_l9:
int 0
return
main_l10:
int 0
return
main_l11:
int 0
return
main_l12:
callsub oncreate_0
int 1
return

// on_create
oncreate_0:
txn NumAppArgs
int 4
==
assert
byte "creator"
txna Accounts 1
app_global_put
txna ApplicationArgs 0
txna ApplicationArgs 1
app_global_put
byte "video"
txna ApplicationArgs 2
app_global_put
byte "slides"
txna ApplicationArgs 3
app_global_put
retsub`
;
export default createBox;

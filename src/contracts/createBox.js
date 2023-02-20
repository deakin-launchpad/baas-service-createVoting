const createBox = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l14
txn OnCompletion
int DeleteApplication
==
bnz main_l13
txn OnCompletion
int UpdateApplication
==
bnz main_l12
txn OnCompletion
int OptIn
==
bnz main_l11
txn OnCompletion
int CloseOut
==
bnz main_l10
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "update_result"
==
bnz main_l9
err
main_l9:
callsub getresult_2
int 0
return
main_l10:
int 0
return
main_l11:
int 0
return
main_l12:
int 0
return
main_l13:
int 0
return
main_l14:
callsub oncreate_1
int 1
return

// get_global_value
getglobalvalue_0:
store 7
store 6
load 6
load 7
app_global_get_ex
store 9
store 8
load 8
retsub

// on_create
oncreate_1:
txn NumAppArgs
int 0
==
assert
byte "governor"
int 0
app_global_put
retsub

// get_result
getresult_2:
txna ApplicationArgs 1
store 3
txna ApplicationArgs 2
store 4
txna Applications 1
store 0
load 0
byte "voting_end"
callsub getglobalvalue_0
store 1
load 0
byte "proposal"
callsub getglobalvalue_0
store 2
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 5
getresult_2_l1:
load 5
int 1
<
bnz getresult_2_l7
byte "governor"
app_global_get
int 0
==
global LatestTimestamp
load 1
>
&&
load 3
byte "completed"
==
load 3
byte "invalid"
==
||
&&
txn NumAppArgs
int 3
==
&&
assert
byte "governor"
load 0
app_global_put
byte "proposal"
load 2
app_global_put
txna ApplicationArgs 1
int 1
app_global_put
load 3
byte "completed"
==
bnz getresult_2_l6
load 3
byte "invalid"
==
bnz getresult_2_l5
err
getresult_2_l5:
load 4
int 1
app_global_put
b getresult_2_l8
getresult_2_l6:
load 4
load 0
load 4
callsub getglobalvalue_0
app_global_put
b getresult_2_l8
getresult_2_l7:
load 5
gtxns RekeyTo
global ZeroAddress
==
assert
load 5
int 1
+
store 5
b getresult_2_l1
getresult_2_l8:
int 1
return`
;
export default createBox;

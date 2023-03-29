const createGovernor = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l19
txn OnCompletion
int DeleteApplication
==
bnz main_l18
txn OnCompletion
int UpdateApplication
==
bnz main_l17
txn OnCompletion
int OptIn
==
bnz main_l16
txn OnCompletion
int CloseOut
==
bnz main_l15
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "vote"
==
bnz main_l14
txna ApplicationArgs 0
byte "add_options"
==
bnz main_l13
txna ApplicationArgs 0
byte "finalize"
==
bnz main_l11
err
main_l11:
callsub finalizevoting_7
main_l12:
int 0
return
main_l13:
callsub addoptions_2
b main_l12
main_l14:
callsub voting_5
b main_l12
main_l15:
int 0
return
main_l16:
int 0
callsub optIntovote_3
int 1
return
main_l17:
int 0
return
main_l18:
int 0
return
main_l19:
callsub oncreate_1
int 1
return

// convert_uint_to_bytes
convertuinttobytes_0:
store 14
load 14
int 0
==
bnz convertuinttobytes_0_l5
byte ""
store 15
load 14
store 16
convertuinttobytes_0_l2:
load 16
int 0
>
bnz convertuinttobytes_0_l4
load 15
b convertuinttobytes_0_l6
convertuinttobytes_0_l4:
load 16
int 10
%
store 17
byte "0123456789"
load 17
load 17
int 1
+
substring3
load 15
concat
store 15
load 16
int 10
/
store 16
b convertuinttobytes_0_l2
convertuinttobytes_0_l5:
byte "0"
convertuinttobytes_0_l6:
retsub

// on_create
oncreate_1:
global LatestTimestamp
store 0
int 0
store 1
txn NumAppArgs
int 4
==
assert
byte "governor_token"
txna Assets 0
app_global_put
byte "proposal"
txna ApplicationArgs 0
app_global_put
byte "result_box"
int 0
app_global_put
byte "min_token_to_vote"
txna ApplicationArgs 1
btoi
app_global_put
byte "choose"
txna ApplicationArgs 2
btoi
app_global_put
byte "voting_end"
txna ApplicationArgs 3
btoi
app_global_put
byte "total_number_of_options"
int 0
app_global_put
retsub

// add_options
addoptions_2:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 4
addoptions_2_l1:
load 4
int 1
<
bnz addoptions_2_l5
byte "total_number_of_options"
app_global_get
int 0
==
txn NumAppArgs
int 2
>=
&&
assert
int 0
store 3
int 1
store 2
addoptions_2_l3:
load 2
txn NumAppArgs
<
bz addoptions_2_l6
load 3
int 1
+
store 3
load 2
txnas ApplicationArgs
int 0
app_global_put
load 2
int 1
+
store 2
b addoptions_2_l3
addoptions_2_l5:
load 4
gtxns RekeyTo
global ZeroAddress
==
assert
load 4
int 1
+
store 4
b addoptions_2_l1
addoptions_2_l6:
byte "total_number_of_options"
load 3
app_global_put
int 1
return

// optIn_to_vote
optIntovote_3:
store 5
global LatestTimestamp
byte "voting_end"
app_global_get
<=
assert
load 5
byte "voted"
int 0
app_local_put
retsub

// get_global_value
getglobalvalue_4:
store 20
store 19
store 18
load 18
load 19
app_global_get_ex
store 22
store 21
load 20
byte "value"
==
bnz getglobalvalue_4_l4
load 20
byte "has_value"
==
bnz getglobalvalue_4_l3
err
getglobalvalue_4_l3:
load 22
retsub
getglobalvalue_4_l4:
load 21
retsub
int 0
return

// voting
voting_5:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 13
voting_5_l1:
load 13
int 1
<
bnz voting_5_l8
byte "governor_token"
app_global_get
store 6
byte "min_token_to_vote"
app_global_get
store 7
byte "choose"
app_global_get
store 8
byte "voting_end"
app_global_get
store 9
txn Sender
txna Assets 0
asset_holding_get AssetBalance
store 12
store 11
txn Sender
int 0
app_opted_in
txna Assets 0
load 6
==
&&
byte "total_number_of_options"
app_global_get
int 0
>
&&
global LatestTimestamp
load 9
<=
&&
load 11
load 7
>=
&&
txn Sender
byte "voted"
app_local_get
int 0
==
&&
txn NumAppArgs
load 8
int 1
+
==
&&
assert
int 1
store 10
voting_5_l3:
load 10
load 8
<=
bnz voting_5_l7
int 1
store 10
voting_5_l5:
load 10
load 8
<=
bz voting_5_l9
load 10
txnas ApplicationArgs
load 10
txnas ApplicationArgs
app_global_get
int 1
+
app_global_put
txn Sender
load 10
callsub convertuinttobytes_0
load 10
txnas ApplicationArgs
app_local_put
load 10
int 1
+
store 10
b voting_5_l5
voting_5_l7:
global CurrentApplicationID
load 10
txnas ApplicationArgs
byte "has_value"
callsub getglobalvalue_4
load 10
txnas ApplicationArgs
app_global_get
int 0
>=
&&
assert
load 10
int 1
+
store 10
b voting_5_l3
voting_5_l8:
load 13
gtxns RekeyTo
global ZeroAddress
==
assert
load 13
int 1
+
store 13
b voting_5_l1
voting_5_l9:
txn Sender
byte "voted"
int 1
app_local_put
int 1
return

// activate_a_result_box
activatearesultbox_6:
store 34
store 33
store 32
byte "update_result"
store 35
itxn_begin
int appl
itxn_field TypeEnum
load 32
itxn_field ApplicationID
int NoOp
itxn_field OnCompletion
load 35
itxn_field ApplicationArgs
load 33
itxn_field ApplicationArgs
load 34
itxn_field ApplicationArgs
global CurrentApplicationID
itxn_field Applications
itxn_submit
retsub

// finalize_voting
finalizevoting_7:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 31
finalizevoting_7_l1:
load 31
int 1
<
bnz finalizevoting_7_l15
byte "voting_end"
app_global_get
store 23
byte "total_number_of_options"
app_global_get
store 24
int 0
store 26
byte ""
store 29
int 0
store 28
txna Applications 1
store 30
global LatestTimestamp
load 23
>
global CurrentApplicationID
byte "result_box"
byte "has_value"
callsub getglobalvalue_4
&&
byte "result_box"
app_global_get
int 0
==
&&
load 30
byte "governor"
byte "has_value"
callsub getglobalvalue_4
&&
load 30
byte "governor"
byte "value"
callsub getglobalvalue_4
int 0
==
&&
txn NumAppArgs
load 24
int 1
+
==
&&
assert
int 1
store 25
finalizevoting_7_l3:
load 25
load 24
<=
bnz finalizevoting_7_l12
int 1
store 25
finalizevoting_7_l5:
load 25
load 24
<=
bnz finalizevoting_7_l9
load 28
int 1
==
bnz finalizevoting_7_l8
load 30
byte "invalid"
byte "invalid"
callsub activatearesultbox_6
b finalizevoting_7_l16
finalizevoting_7_l8:
load 30
byte "completed"
load 29
callsub activatearesultbox_6
b finalizevoting_7_l16
finalizevoting_7_l9:
load 25
txnas ApplicationArgs
app_global_get
store 27
load 27
load 26
==
bnz finalizevoting_7_l11
finalizevoting_7_l10:
load 25
int 1
+
store 25
b finalizevoting_7_l5
finalizevoting_7_l11:
load 28
int 1
+
store 28
load 25
txnas ApplicationArgs
store 29
b finalizevoting_7_l10
finalizevoting_7_l12:
load 25
txnas ApplicationArgs
app_global_get
store 27
global CurrentApplicationID
load 25
txnas ApplicationArgs
byte "has_value"
callsub getglobalvalue_4
load 27
int 0
>=
&&
assert
load 27
load 26
>
bnz finalizevoting_7_l14
finalizevoting_7_l13:
load 25
int 1
+
store 25
b finalizevoting_7_l3
finalizevoting_7_l14:
load 27
store 26
b finalizevoting_7_l13
finalizevoting_7_l15:
load 31
gtxns RekeyTo
global ZeroAddress
==
assert
load 31
int 1
+
store 31
b finalizevoting_7_l1
finalizevoting_7_l16:
byte "result_box"
load 30
app_global_put
int 1
return
`;

export default createGovernor;
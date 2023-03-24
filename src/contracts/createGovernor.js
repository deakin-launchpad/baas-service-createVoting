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
callsub finalizevoting_8
main_l12:
int 0
return
main_l13:
callsub addoptions_4
b main_l12
main_l14:
callsub voting_6
b main_l12
main_l15:
int 0
return
main_l16:
int 0
callsub optIntovote_5
int 1
return
main_l17:
int 0
return
main_l18:
int 0
return
main_l19:
callsub oncreate_3
int 1
return

// convert_uint_to_bytes
convertuinttobytes_0:
store 19
load 19
int 0
==
bnz convertuinttobytes_0_l5
byte ""
store 20
load 19
store 21
convertuinttobytes_0_l2:
load 21
int 0
>
bnz convertuinttobytes_0_l4
load 20
b convertuinttobytes_0_l6
convertuinttobytes_0_l4:
load 21
int 10
%
store 22
byte "0123456789"
load 22
load 22
int 1
+
substring3
load 20
concat
store 20
load 21
int 10
/
store 21
b convertuinttobytes_0_l2
convertuinttobytes_0_l5:
byte "0"
convertuinttobytes_0_l6:
retsub

// get_global_value
getglobalvalue_1:
store 7
store 6
store 5
load 5
load 6
app_global_get_ex
store 9
store 8
load 7
byte "value"
==
bnz getglobalvalue_1_l4
load 7
byte "has_value"
==
bnz getglobalvalue_1_l3
err
getglobalvalue_1_l3:
load 9
retsub
getglobalvalue_1_l4:
load 8
retsub
int 0
return

// get_local_value
getlocalvalue_2:
store 26
store 25
store 24
store 23
load 23
load 24
load 25
app_local_get_ex
store 28
store 27
load 26
byte "value"
==
bnz getlocalvalue_2_l4
load 26
byte "has_value"
==
bnz getlocalvalue_2_l3
err
getlocalvalue_2_l3:
load 28
retsub
getlocalvalue_2_l4:
load 27
retsub
int 0
return

// on_create
oncreate_3:
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
addoptions_4:
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
addoptions_4_l1:
load 4
int 1
<
bnz addoptions_4_l5
global CurrentApplicationID
byte "total_number_of_options"
byte "has_value"
callsub getglobalvalue_1
byte "total_number_of_options"
app_global_get
int 0
==
&&
txn NumAppArgs
int 2
>=
&&
assert
int 0
store 3
int 1
store 2
addoptions_4_l3:
load 2
txn NumAppArgs
<
bz addoptions_4_l6
load 2
txnas ApplicationArgs
btoi
byte "creator"
byte "has_value"
callsub getglobalvalue_1
assert
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
b addoptions_4_l3
addoptions_4_l5:
load 4
gtxns RekeyTo
global ZeroAddress
==
assert
load 4
int 1
+
store 4
b addoptions_4_l1
addoptions_4_l6:
byte "total_number_of_options"
load 3
app_global_put
int 1
return

// optIn_to_vote
optIntovote_5:
store 10
global LatestTimestamp
byte "voting_end"
app_global_get
<=
assert
load 10
byte "voted"
int 0
app_local_put
retsub

// voting
voting_6:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 18
voting_6_l1:
load 18
int 1
<
bnz voting_6_l8
byte "governor_token"
app_global_get
store 11
byte "min_token_to_vote"
app_global_get
store 12
byte "choose"
app_global_get
store 13
byte "voting_end"
app_global_get
store 14
txn Sender
txna Assets 0
asset_holding_get AssetBalance
store 17
store 16
txn Sender
int 0
app_opted_in
txna Assets 0
load 11
==
&&
byte "total_number_of_options"
app_global_get
int 0
>
&&
global LatestTimestamp
load 14
<=
&&
load 16
load 12
>=
&&
txn Sender
global CurrentApplicationID
byte "voted"
byte "has_value"
callsub getlocalvalue_2
&&
txn Sender
byte "voted"
app_local_get
int 0
==
&&
txn NumAppArgs
load 13
int 1
+
==
&&
assert
int 1
store 15
voting_6_l3:
load 15
load 13
<=
bnz voting_6_l7
int 1
store 15
voting_6_l5:
load 15
load 13
<=
bz voting_6_l9
load 15
txnas ApplicationArgs
load 15
txnas ApplicationArgs
app_global_get
int 1
+
app_global_put
txn Sender
load 15
callsub convertuinttobytes_0
load 15
txnas ApplicationArgs
app_local_put
load 15
int 1
+
store 15
b voting_6_l5
voting_6_l7:
global CurrentApplicationID
load 15
txnas ApplicationArgs
byte "has_value"
callsub getglobalvalue_1
load 15
txnas ApplicationArgs
app_global_get
int 0
>=
&&
assert
load 15
int 1
+
store 15
b voting_6_l3
voting_6_l8:
load 18
gtxns RekeyTo
global ZeroAddress
==
assert
load 18
int 1
+
store 18
b voting_6_l1
voting_6_l9:
txn Sender
byte "voted"
int 1
app_local_put
int 1
return

// activate_a_result_box
activatearesultbox_7:
store 40
store 39
store 38
byte "update_result"
store 41
itxn_begin
int appl
itxn_field TypeEnum
load 38
itxn_field ApplicationID
int NoOp
itxn_field OnCompletion
load 41
itxn_field ApplicationArgs
load 39
itxn_field ApplicationArgs
load 40
itxn_field ApplicationArgs
global CurrentApplicationID
itxn_field Applications
itxn_submit
retsub

// finalize_voting
finalizevoting_8:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 37
finalizevoting_8_l1:
load 37
int 1
<
bnz finalizevoting_8_l15
byte "voting_end"
app_global_get
store 29
byte "total_number_of_options"
app_global_get
store 30
int 0
store 32
byte ""
store 35
int 0
store 34
txna Applications 1
store 36
global LatestTimestamp
load 29
>
global CurrentApplicationID
byte "result_box"
byte "has_value"
callsub getglobalvalue_1
&&
byte "result_box"
app_global_get
int 0
==
&&
load 36
byte "governor"
byte "has_value"
callsub getglobalvalue_1
&&
load 36
byte "governor"
byte "value"
callsub getglobalvalue_1
int 0
==
&&
txn NumAppArgs
load 30
int 1
+
==
&&
assert
int 1
store 31
finalizevoting_8_l3:
load 31
load 30
<=
bnz finalizevoting_8_l12
int 1
store 31
finalizevoting_8_l5:
load 31
load 30
<=
bnz finalizevoting_8_l9
load 34
int 1
==
bnz finalizevoting_8_l8
load 36
byte "invalid"
byte "invalid"
callsub activatearesultbox_7
b finalizevoting_8_l16
finalizevoting_8_l8:
load 36
byte "completed"
load 35
callsub activatearesultbox_7
b finalizevoting_8_l16
finalizevoting_8_l9:
load 31
txnas ApplicationArgs
app_global_get
store 33
load 33
load 32
==
bnz finalizevoting_8_l11
finalizevoting_8_l10:
load 31
int 1
+
store 31
b finalizevoting_8_l5
finalizevoting_8_l11:
load 34
int 1
+
store 34
load 31
txnas ApplicationArgs
store 35
b finalizevoting_8_l10
finalizevoting_8_l12:
load 31
txnas ApplicationArgs
app_global_get
store 33
global CurrentApplicationID
load 31
txnas ApplicationArgs
byte "has_value"
callsub getglobalvalue_1
load 33
int 0
>=
&&
assert
load 33
load 32
>
bnz finalizevoting_8_l14
finalizevoting_8_l13:
load 31
int 1
+
store 31
b finalizevoting_8_l3
finalizevoting_8_l14:
load 33
store 32
b finalizevoting_8_l13
finalizevoting_8_l15:
load 37
gtxns RekeyTo
global ZeroAddress
==
assert
load 37
int 1
+
store 37
b finalizevoting_8_l1
finalizevoting_8_l16:
byte "result_box"
load 36
app_global_put
int 1
return
`;

export default createGovernor;
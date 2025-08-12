
unit Consts;

interface

Const

  Color_Item = $FFEFECEF;
  Duration_Item = 0.5;
  Delay_Item = 0.1;

  DLG_CONFIRME_DELETE = 'Confirme Delete';
  MSG_NOTIFICTION = 'Notifiction';
  MSG_SAVE_DONE = 'Save Done';
  MSG_NOT_AUTH = 'Not Auth';
  MSG_ERROR_CONNECTION_DB = 'Error Connection To Data Base ';
  MSG_DLG_SET_CONFIG_CONNECTION_DB = ' You Want Entre Config Connection ? ';

 SQL_LOAD_CREDITS = '  Select * From Credits Where ID Like %s ';
 SQL_LOAD_CLIENTS = '  Select * From Clients Where ID Like %s ';


implementation

end.


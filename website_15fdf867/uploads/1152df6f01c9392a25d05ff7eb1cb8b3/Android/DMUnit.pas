 
unit DmUnit;

interface

uses
  System.SysUtils, System.Classes, FireDAC.Stan.Intf, FireDAC.Stan.Option,
  FireDAC.Stan.Error, FireDAC.UI.Intf, FireDAC.Phys.Intf, FireDAC.Stan.Def,
  FireDAC.Stan.Pool, FireDAC.Stan.Async, FireDAC.Phys, FireDAC.FMXUI.Wait,
  FireDAC.Stan.ExprFuncs, FireDAC.Phys.SQLiteDef, FireDAC.Phys.SQLite, Data.DB,
  FireDAC.Comp.Client, FMX.Forms, Controllers,
  //// FireDAC.VCLUI.Wait,
{$IFDEF ANDROID}
  FMX.Dialogs,
{$ENDIF}
{$IFDEF MSWINDOWS}
  FMX.Dialogs,
{$ENDIF}
  FMX.Types, FMX.Controls,   IOUtils,
  FireDAC.Comp.UI, FireDAC.Stan.Param, FireDAC.DatS,
  FireDAC.DApt.Intf, FireDAC.DApt, FireDAC.Comp.DataSet, inifiles,
  System.ImageList, FMX.ImgList, RTL.Controls, GSUnit, SQLServerUniProvider,
  SQLiteUniProvider, UniProvider, MySQLUniProvider, DBAccess, Uni;

type

  TDM = class(TDataModule)
    FDGUIxWaitCursor1: TFDGUIxWaitCursor;
    RTLFixer1: TRTLFixer;
    GS: TGS;
    UniConnection: TUniConnection;
    MySQLUniProvider1: TMySQLUniProvider;
    SQLiteUniProvider1: TSQLiteUniProvider;
    SQLServerUniProvider1: TSQLServerUniProvider;
    procedure DataModuleCreate(Sender: TObject);
    procedure DataModuleDestroy(Sender: TObject);

  private
    FDBCtrl: TDBController;
    { Private declarations }

    function GetDBCtrl: TDBController;

  public
    property DBCtrl: TDBController read GetDBCtrl write FDBCtrl;
    { Public declarations }
    function GetAuth(aStr: string): Boolean;
    function NewQuery: TUniQuery;
    function Login(aUsername, aPassword: string): Boolean;
    procedure AlertMessage;
    procedure FreeObjectCB(aItems: Tstrings);
    function CheckConnection: Boolean;

  var

    IsConnect, IsActive, IsLogin: Boolean;
    ID, NameServer, PathLocal: string;
    Separator: string;

  end;

var
  DM: TDM;

implementation

{ %CLASSGROUP 'Vcl.Controls.TControl' }

uses Consts;

{$R *.dfm}
{ TDM }

procedure TDM.DataModuleCreate(Sender: TObject);
var
  IsConnected: Boolean;
begin

{$IFDEF MSWINDOWS}
  PathLocal := ExtractFilePath(ParamStr(0));
  //// FDPhysMySQLDriverLink1.VendorLib := PathLocal + 'libmysql.dll';
{$ENDIF}
{$IF DEFINED(IOS) or DEFINED(ANDROID)}
  PathLocal := TPath.GetDocumentsPath + PathDelim;
{$ENDIF}
  //// UniConnection.Database := PathLocal + 'DB.db';

end;

procedure TDM.DataModuleDestroy(Sender: TObject);
begin
  FDBCtrl.Free;
end;

procedure TDM.FreeObjectCB(aItems: Tstrings);
begin
  GS.FreeItems(aItems);
end;

procedure TDM.AlertMessage;
begin
  ShowMessage(MSG_SAVE_DONE);

{$IFDEF MSWINDOWS}
{$ENDIF}
{$IF DEFINED(IOS) or DEFINED(ANDROID)}
{$ENDIF}
end;

function TDM.GetAuth(aStr: string): Boolean;
begin
  { Result := True;
    Exit;
    with TUser.Create(ID) do
    try
    with TRole.Create(Role_id) do
    try
    Result := GS.IsStringInListString(aStr, Auth);
    if not Result then
    ShowMessage(NOT_AUTH);
    finally
    Free;
    end;
    finally
    Free;
    end; }
end;

function TDM.GetDBCtrl: TDBController;
begin
  if Assigned(FDBCtrl) then
    FDBCtrl.Free;
  FDBCtrl := TDBController.Create(UniConnection);
  Result := FDBCtrl;
end;

function TDM.Login(aUsername, aPassword: string): Boolean;
var
  Qry: TUniQuery;
begin
  Result := true;
  {
    Result := false;
    Qry := dm.NewQuery;
    try
    Qry.SQL.Text := ' select ID from  Users where  Username  = :Username and  '
    + '  PassWord  = :PassWord ';
    Qry.ParamByName('Username').Value := aUsername;
    Qry.ParamByName('PassWord').Value := dm.GS.EncryptSTR(aPassword);
    Qry.Open();
    if Qry.FieldByName('ID').Asstring <> EmptyStr then
    begin
    ID := Qry.FieldByName('ID').Asstring;
    Result := True;
    end;
    finally
    Qry.Free;
    end; }
end;

function TDM.NewQuery: TUniQuery;
begin
  Result := TUniQuery.Create(Self);
  Result.Connection := UniConnection;
end;

function TDM.CheckConnection: Boolean;
begin
  Result := False;
  try
    UniConnection.Open();
    Result := UniConnection.Connected;
  except
  end;
end;

end.

 

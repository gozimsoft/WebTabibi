
unit DmUnit;

interface

uses
  System.SysUtils, System.Classes, FireDAC.Stan.Intf, FireDAC.Stan.Option,
  Windows, System.UiTypes,
  FireDAC.Stan.Error, FireDAC.UI.Intf, FireDAC.Phys.Intf, FireDAC.Stan.Def,
  FireDAC.Stan.Pool, FireDAC.Stan.Async, FireDAC.Phys, FireDAC.VCLUI.Wait,
  Data.DB, FireDAC.Comp.Client, Datasnap.DBClient, System.ImageList,
  Vcl.ImgList, Vcl.Controls, FireDAC.Stan.Param, FireDAC.DatS, Vcl.StdCtrls,
  FireDAC.DApt.Intf, FireDAC.DApt, FireDAC.Comp.DataSet, FireDAC.Phys.MSAcc,
  FireDAC.Phys.MSAccDef, Graphics, Variants, inifiles, frxClass,
  frxDBSet, FireDAC.Phys.MSSQL, FireDAC.Phys.MSSQLDef, FireDAC.Phys.ODBCBase,
  Vcl.Forms,
  FireDAC.Phys.MySQL, Vcl.DBGrids, FireDAC.Phys.MySQLDef, Dialogs,
  comobj, cxLookAndFeelPainters, cxGraphics, dxSkinsCore, dxSkinBlack,
  dxSkinBlue, dxSkinBlueprint, dxSkinCaramel, dxSkinCoffee, dxSkinDarkRoom,
  dxSkinDarkSide, dxSkinDevExpressDarkStyle, dxSkinDevExpressStyle, dxSkinFoggy,
  dxSkinGlassOceans, dxSkinHighContrast, dxSkiniMaginary, dxSkinLilian,
  dxSkinLiquidSky, dxSkinLondonLiquidSky, dxSkinMcSkin, dxSkinMetropolis,
  dxSkinMetropolisDark, dxSkinMoneyTwins, dxSkinOffice2007Black,
  dxSkinOffice2007Blue, dxSkinOffice2007Green, dxSkinOffice2007Pink,
  dxSkinOffice2007Silver, dxSkinOffice2010Black, dxSkinOffice2010Blue,
  dxSkinOffice2010Silver, dxSkinOffice2013DarkGray, dxSkinOffice2013LightGray,
  dxSkinOffice2013White, dxSkinOffice2016Colorful, dxSkinOffice2016Dark,
  dxSkinPumpkin, dxSkinSeven, dxSkinSevenClassic, dxSkinSharp, dxSkinSharpPlus,
  dxSkinSilver, dxSkinSpringTime, dxSkinStardust, dxSkinSummer2008,
  dxSkinTheAsphaltWorld, dxSkinsDefaultPainters, dxSkinValentine,
  dxSkinVisualStudio2013Blue, dxSkinVisualStudio2013Dark,
  dxSkinVisualStudio2013Light, dxSkinVS2010, dxSkinWhiteprint,
  dxSkinXmas2008Blue, cxClasses, dxAlertWindow, dxGDIPlusClasses,
  dxSkinTheBezier, Controllers, FireDAC.Phys.SQLite,
  FireDAC.Phys.SQLiteDef, FireDAC.Stan.ExprFuncs, frxExportPDF,
  frxExportBaseDialog, frxExportXLSX, GSUnit, siComp, ArabNum, Uni, UniProvider,
  SQLiteUniProvider, dxSkinBasic, dxSkinOffice2019Black,
  dxSkinOffice2019Colorful, dxSkinOffice2019DarkGray, dxSkinOffice2019White,
  DBAccess ,  ODBCUniProvider, AccessUniProvider, SQLServerUniProvider,
  MySQLUniProvider;

type

  THackControl = class(TControl);

  TDM = class(TDataModule)
    ImageList1: TImageList;
    MSGMessage: TdxAlertWindowManager;
    XLSXExport: TfrxXLSXExport;
    PDFExport: TfrxPDFExport;
    GS: TGS;
    cxImage: TcxImageCollection;
    Item1: TcxImageCollectionItem;
    Item2: TcxImageCollectionItem;
    Item3: TcxImageCollectionItem;
    cxImageItem1: TcxImageCollectionItem;
    Image48: TImageList;
    Image32: TImageList;
    Report: TfrxReport;
    DBDataset: TfrxDBDataset;
    UniConnection: TUniConnection;
    SQLiteUniProvider1: TSQLiteUniProvider;
    AccessUniProvider1: TAccessUniProvider;
    MySQLUniProvider1: TMySQLUniProvider;
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
    procedure SetConnection;

  var

    IsConnect, IsActive, IsLogin: Boolean;
    ID, NameServer, PathLocal: string;
    Separator: string;

  end;

var
  dm: TDM;

implementation

{ %CLASSGROUP 'Vcl.Controls.TControl' }

uses Consts, Printers;

{$R *.dfm}
{ TDM }
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

procedure TDM.DataModuleCreate(Sender: TObject);
var
  IsConnected: Boolean;
begin

  Separator := FormatSettings.DecimalSeparator;
  PathLocal := ExtractFilePath(Application.ExeName);
  Exit;
  while true do
  begin
    SetConnection;
    if dm.CheckConnection then
    begin
      IsConnected := true;
      Break;
    end
    else
    begin
      ShowMessage(MSG_ERROR_CONNECTION_DB);
      if MessageDlg(MSG_DLG_SET_CONFIG_CONNECTION_DB, mtConfirmation,
        [mbYes, mbNo], 0) = mryes then
        if MessageDlg(MSG_ERROR_CONNECTION_DB, mtInformation, [mbYes, mbNo], 0)
          = mryes then
        begin
          { with TFrmSettingConnection.Create(Self) do
            try
            ShowModal;
            finally
            Free;
            end; }
        end
        else
        begin
          IsConnected := False;
          Break;
        end;
    end;
  end;

  if not IsConnected then
    Application.Terminate;

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
  MSGMessage.Show(MSG_NOTIFICTION, MSG_SAVE_DONE);
end;

function TDM.GetAuth(aStr: string): Boolean;
begin
  Result := true;
  {
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
// var
//  Qry: TUniQuery;
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

procedure TDM.SetConnection;
// var
// oParamsMSSSQL: TFDPhysMSSQLConnectionDefParams;
begin

  { oParamsMSSSQL := TFDPhysMSSQLConnectionDefParams(FDConnection.Params);
    with TIniFile.Create(dm.PathLocal + 'config.ini') do
    try
    oParamsMSSSQL.DriverID := 'MSSQL';
    oParamsMSSSQL.Server := ReadString('Connection', 'Server', '(local)');
    oParamsMSSSQL.username := ReadString('Connection', 'username', '');
    oParamsMSSSQL.Password := ReadString('Connection', 'password', '');
    oParamsMSSSQL.Database := ReadString('Connection', 'dbname', 'db');
    oParamsMSSSQL.OSAuthent := ReadBool('Connection', 'Authent', true);
    finally
    Free;
    end; }

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


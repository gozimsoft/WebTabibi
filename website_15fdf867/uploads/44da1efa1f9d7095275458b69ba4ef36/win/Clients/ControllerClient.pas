
unit ControllerClient ;
interface
uses   FireDAC.Comp.Client,  FireDAC.Stan.Param, System.SysUtils
,System.Classes, System.Variants,   json, Data.DB
 ,System.UITypes , DBAccess,
  Uni, UniProvider, SQLiteUniProvider;

type
TClient = class
private
       FID : String;
FName : String;
FAge : Integer;
FImg : TStream;

        function GetImg :TStream;

public
        constructor Create( aID : String ) ;
        destructor Destroy; override;
         property ID : String read FID write  FID ;
 property Name : String read FName write  FName ;
 property Age : Integer read FAge write  FAge ;
 property Img : TStream read GetImg write  FImg ;

        function Save: Boolean;
        function Delete: Boolean;

        class function GetClient( aValue:integer ): TClient;
        class function GetCount : integer ;
        class function First: TClient ;
        class function Last: TClient ;
        class function Clients: Tstrings ;


end;

implementation
uses
DMUnit ;
{ TClient  }
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

constructor TClient.Create(aID : String);
var
        Qry: TUniQuery;
begin
         FImg := TMemoryStream.Create;

        
        if aID = EmptyStr then
           Exit;
        Qry :=  DM.NewQuery;
        try
                Qry.SQL.Text :=
                ' select * from  Clients '
                +' where ID = :ID  ';
                Qry.ParamByName('ID').Value := aID;
                Qry.Open();
                FID := Qry.FieldByName('ID').AsString ;
FName := Qry.FieldByName('Name').AsString ;
FAge := Qry.FieldByName('Age').AsInteger ;

        finally
                Qry.Free;
        end;
end;
function TClient.delete:Boolean;
var
        Qry: TUniQuery;
begin
        Result := False;
        if FID  = EmptyStr then
          Exit;
        Qry := dm.NewQuery;
        try
                Qry.SQL.Text :=
                ' Delete from  Clients '
                + ' where ID = :ID ' ;
                Qry.ParamByName('ID').Value := FID ;
                Qry.ExecSQL;
                Result := True;
        finally
                Qry.Free;
        end;
end;

function TClient.Save: Boolean;
var
        Qry: TUniQuery;
begin
        if FID = EmptyStr then
           FID :=  DM.GS.NewGuid ;
        Qry := DM.NewQuery;
        try
                Qry.SQL.Text :=
                ' select * from  Clients '
                +' where ID= :ID ';
                Qry.ParamByName('ID').Value := FID;
                Qry.Open();
                if Qry.RecordCount > 0 then
                        Qry.Edit
                else
                        Qry.Insert;
                 Qry.FieldByName('ID').AsString  := FID ;
 Qry.FieldByName('Name').AsString  := FName ;
 Qry.FieldByName('Age').AsInteger  := FAge ;

                Qry.Post;
                
        FImg.Position := 0;
        Qry.SQL.Text := DM.GS.Sql_Update('Clients',
  ['Img'
  ],
  ['ID'
  ]);
        Qry.ParamByName('ID').Value := FID;
        Qry.ParamByName('Img').LoadFromStream(FImg, ftBlob);
        Qry.ExecSQL;


                Result := True;
        finally
                Qry.Free;
        end;
end;

class function  TClient.GetCount : integer;
var
  Qry: TUniQuery;
begin
  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select count(*) as c from   Clients ';
    Qry.Open();
    if Qry['c'] <> NULL then
      Result := Qry['c']
    else
      Result := 0;
  finally
    Qry.Free;
  end;

end;


class function  TClient.first: TClient;
begin
        Result := TClient.GetClient( 0 );
end;

class function  TClient.last: TClient;
begin
        Result := TClient.GetClient( 1 );
end;

class function  TClient.GetClient( aValue:integer ): TClient;
var
  Qry: TUniQuery;
begin

  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select ID from Clients ';
    Qry.Open();
    if aValue = 0 then
        Qry.first
    else
        Qry.last ;
    Result :=  TClient.Create(Qry.FieldByName('ID').Asstring);
  finally
    Qry.Free;
  end;

end;

class function  TClient.Clients : TStrings ;
var
  Qry: TUniQuery;
  Client: TClient;
begin
  Result := TStringList.Create;
  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select ID from  Clients ';
    Qry.Open();
    while not Qry.Eof do
    begin
      Client := TClient.Create(Qry['ID']);
      Result.AddObject(Client.ID, Client);
      Qry.Next;
    end;
  finally
    Qry.Free;
  end;
end;




function TClient.GetImg: TStream;
var
  Qry: TUniQuery;
  s: TStream;
begin
  Qry := DM.NewQuery;
  try
    try
      Qry.SQL.Text := ' select  Img from  Clients  where ID = :ID ';
      Qry.ParamByName('ID').Value := FID;
      Qry.Open();
      if Qry.RecordCount > 0 then
      begin
        s := Qry.CreateBlobStream(Qry.FieldByName('Img'), bmRead);
        try
          s.Position := 0;
          FImg.CopyFrom(s, s.Size);
        finally
          s.Free;
        end;
      end;
    except
      raise Exception.Create('Error Load Img  ');
    end;
  finally
    Qry.Free;
  end;
  FImg.Position := 0;
  Result := FImg;

end;



destructor TClient.Destroy;
begin
 FImg.Free; 

  inherited;
end;

end.

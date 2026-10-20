# Educational .NET 10 Linux example. Supply verified image digests for a release.
ARG SDK_IMAGE=mcr.microsoft.com/dotnet/sdk:10.0
ARG RUNTIME_IMAGE=mcr.microsoft.com/dotnet/aspnet:10.0
FROM ${SDK_IMAGE} AS build
WORKDIR /src
COPY OpsExample.csproj ./
RUN dotnet restore OpsExample.csproj
COPY Program.cs ./
RUN dotnet publish OpsExample.csproj -c Release --no-restore -o /out /p:UseAppHost=false

FROM ${RUNTIME_IMAGE} AS runtime
WORKDIR /app
COPY --from=build /out ./
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "OpsExample.dll"]

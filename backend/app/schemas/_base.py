from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for all API schemas. Python/DB side stays snake_case (idiomatic,
    matches the SQLAlchemy columns); JSON in/out is camelCase, matching the
    frontend's existing TypeScript interfaces exactly, so wiring the frontend
    needs zero field-name translation in either direction.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

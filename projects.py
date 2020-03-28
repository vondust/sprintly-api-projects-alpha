from datetime import datetime
from flask import jsonify, make_response, abort

def get_timestamp():
	return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

PROJECTS = {
	"Projeto1": {
		"name": "Projeto1",
		"description": "Primeiro projeto do programa",
		"timestamp": get_timestamp(),
	},
}

def read_all():
	dict_projects = [PROJECTS[key] for key in sorted(PROJECTS.keys())]
	projects = jsonify(dict_projects)
	qtd = len(dict_projects)
	content_range = "projetos 0-"+str(qtd)+"/"+str(qtd)
	# Configura headers
	projects.headers['Access-Control-Allow-Origin'] = '*'
	projects.headers['Access-Control-Expose-Headers'] = 'Content-Range'
	projects.headers['Content-Range'] = content_range
	return projects

def read_one(name):
    if name in PROJECTS:
        project = PROJECTS.get(name)
    else:
        abort(
            404, "Projeto {name} não encontrado".format(name=name)
        )
    return project


def create(project):
    name = project.get("name", None)
    description = project.get("description", None)

    if name not in PROJECTS and name is not None:
        PROJECTS[name] = {
            "name": name,
            "description": description,
            "timestamp": get_timestamp(),
        }
        return make_response(
            "{name} criado com sucesso".format(name=name), 201
        )
    else:
        abort(
            406,
            "Projeto com nome {name} já existe".format(name=name),
        )


def update(name, project):
    if name in PROJECTS:
        PROJECTS[name]["description"] = project.get("description")
        PROJECTS[name]["timestamp"] = get_timestamp()

        return PROJECTS[name]
    else:
        abort(
            404, "Projeto com nome {name} não encontrado".format(name=name)
        )

def delete(name):
    if name in PROJECTS:
        del PROJECTS[name]
        return make_response(
            "{name} deletado com sucesso".format(name=name), 200
        )
    else:
        abort(
            404, "Projeto com nome {name} não encontrado".format(name=name)
        )

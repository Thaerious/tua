FooBar = {
    a = 0,
    b = 1,
    c = 2,
    d = 100,
    e = nil,
    f = nil
};

function FooBar:new()
    local child = {};
    setmetatable(child, {
        __index = self
    });
    return child;
end

function FooBar:foo()
    print("fooz");
end

function FooBar:bar()
    print("barz");
end

print(FooBar:new().foo());
